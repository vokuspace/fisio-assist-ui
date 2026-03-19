import { bootstrapApplication } from '@angular/platform-browser';
import { ShellComponent } from './app/shell.component';
import { APP_CONFIG } from './app/app.config';

bootstrapApplication(ShellComponent, APP_CONFIG).catch(err => console.error(err));
