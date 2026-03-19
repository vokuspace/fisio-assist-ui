import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RgpdBannerComponent } from './components/rgpd/rgpd.components';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RgpdBannerComponent],
  template: `
    <router-outlet></router-outlet>
    <app-rgpd-banner></app-rgpd-banner>
  `
})
export class ShellComponent {}
