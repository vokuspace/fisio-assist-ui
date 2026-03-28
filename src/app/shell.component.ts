import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RgpdBannerComponent } from './components/gdpr/gdpr.components';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RgpdBannerComponent],
  template: `
    <router-outlet></router-outlet>
    <app-gdpr-banner></app-gdpr-banner>
  `
})
export class ShellComponent {}
