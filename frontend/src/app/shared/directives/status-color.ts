import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appStatusColor]',
  standalone: true
})
export class StatusColorDirective implements OnChanges {
  @Input('appStatusColor') eliminado!: boolean;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges() {
  const color = this.eliminado ? '#e74c3c' : '#2ecc71'; // Rojo si está eliminado, Verde si no
  this.renderer.setStyle(this.el.nativeElement, 'color', color);
}
}