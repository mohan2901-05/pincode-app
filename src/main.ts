import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { PincodeComponent } from './app/pincode/pincode';

bootstrapApplication(PincodeComponent, appConfig)
  .catch((err) => console.error(err));
