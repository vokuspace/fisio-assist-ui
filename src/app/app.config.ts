import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { OlvidePasswordComponent } from './components/olvide-password/olvide-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { authGuard } from './guards/auth.guard';
import { authInterceptor } from './interceptors/auth.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

const routes = [
  { path: '', canActivate: [authGuard], component: AppComponent as any },
  { path: 'login', component: LoginComponent },
  { path: 'registro',          component: RegistroComponent },
  { path: 'olvide-password',   component: OlvidePasswordComponent },
  { path: 'reset-password',    component: ResetPasswordComponent },
  { path: '**', redirectTo: '' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations()
  ]
};

export const APP_CONFIG = appConfig;
