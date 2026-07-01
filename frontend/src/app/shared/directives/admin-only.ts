import { Directive, ElementRef, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../../app/core/services/auth.service'; 

@Directive({
  selector: '[appAdminOnly]',
  standalone: true
})
export class AdminOnlyDirective implements OnInit {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService 
  ) {}

  ngOnInit() {
    const isAdmin = this.authService.isAdmin(); 

    if (isAdmin) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}