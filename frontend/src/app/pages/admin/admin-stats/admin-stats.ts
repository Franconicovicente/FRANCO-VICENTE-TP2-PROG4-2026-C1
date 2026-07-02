import { Component, inject, signal, OnInit, viewChild, ElementRef, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Chart, registerables } from 'chart.js';
import { forkJoin } from 'rxjs'; // <-- Importante para combinar las peticiones

Chart.register(...registerables);

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [],
  templateUrl: './admin-stats.html',
  styleUrls: ['./admin-stats.css']
})
export class AdminStatsComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stats`;

  rangoDias = signal<number | null>(null);
  
  // Guardamos las referencias de los gráficos
  canvasLineas = viewChild<ElementRef<HTMLCanvasElement>>('canvasLineas');
  canvasTorta = viewChild<ElementRef<HTMLCanvasElement>>('canvasTorta');
  chartLineasInstance: Chart | null = null;
  chartTortaInstance: Chart | null = null;

  // Signal para controlar si ya cargó la data real
  cargado = signal<boolean>(false);

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cambiarRango(dias: number | null) {
    this.rangoDias.set(dias);
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
  this.cargado.set(false);
  let params = new HttpParams();
  if (this.rangoDias()) {
    params = params.set('dias', this.rangoDias()!.toString());
  }

  forkJoin({
    postsUser: this.http.get<any[]>(`${this.apiUrl}/posts-por-usuario`, { params }),
    commentsFecha: this.http.get<any[]>(`${this.apiUrl}/comentarios-por-fecha`, { params }),
    commentsPost: this.http.get<any[]>(`${this.apiUrl}/comentarios-por-publicacion`, { params })
  }).subscribe({
    next: (res) => {
      console.log('Respuesta posts-por-usuario:', res.postsUser);
      console.log('Respuesta comentarios-por-fecha:', res.commentsFecha);

      this.cargado.set(true);
      
      setTimeout(() => {
        this.renderGraficoBarrasUsuarios(res.postsUser);
        this.renderGraficoLineasComentarios(res.commentsFecha);
      }, 50);
    },
    error: (err) => {
      console.error('Error al traer las estadísticas reales:', err);
    }
  });
}

  // 1. Gráfico de Barras: Cantidad de Posts por Usuario
  renderGraficoBarrasUsuarios(data: any[]) {
    const ctx = this.canvasTorta()?.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.chartTortaInstance) this.chartTortaInstance.destroy();

    // MAPEADO CORRECTO SEGÚN TU CONSOLA: (.username y .cantidad)
    const nombres = data.map(item => item.username || 'Usuario');
    const cantidadPosts = data.map(item => item.cantidad || 0);

    this.chartTortaInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: nombres,
        datasets: [{
          label: 'Posts Creados',
          data: cantidadPosts,
          backgroundColor: '#3498db',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { 
          legend: { display: false } 
        },
        scales: {
          x: { ticks: { color: '#aaa' } },
          y: { 
            ticks: { color: '#aaa', stepSize: 1 },
            beginAtZero: true
          }
        }
      }
    });
  }

  // 2. Gráfico de Líneas: Comentarios por Fecha
  renderGraficoLineasComentarios(data: any[]) {
    const ctx = this.canvasLineas()?.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.chartLineasInstance) this.chartLineasInstance.destroy();

    
    const fechas = data.map(item => item.fecha || 'Fecha');
    const cantidadComentarios = data.map(item => item.cantidad || 0);

    this.chartLineasInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Comentarios Nuevos',
          data: cantidadComentarios,
          borderColor: '#2ecc71',
          backgroundColor: 'rgba(46, 204, 113, 0.2)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { 
          legend: { labels: { color: '#fff' } } 
        },
        scales: {
          x: { ticks: { color: '#aaa' } },
          y: { 
            ticks: { color: '#aaa', stepSize: 1 },
            beginAtZero: true
          }
        }
      }
    });
  }
}