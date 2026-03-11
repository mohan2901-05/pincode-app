import { Component } from '@angular/core';
import { PincodeComponent } from './pincode/pincode';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PincodeComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {}