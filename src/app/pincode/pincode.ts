import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pincode',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './pincode.html',
  styleUrls: ['./pincode.css']
})
export class PincodeComponent {

  pincode: string = "";
  postOffices: any[] = [];
  errorMessage: string = "";

  constructor(private http: HttpClient) {}

  getPincodeDetails() {

    this.errorMessage = "";
    this.postOffices = [];

    if (this.pincode.length !== 6) {
      this.errorMessage = "Please enter a valid 6-digit pincode.";
      return;
    }

    const url = "https://api.postalpincode.in/pincode/" + this.pincode;

    this.http.get<any>(url).subscribe(response => {

      if (response[0].Status === "Success") {
        this.postOffices = response[0].PostOffice;
      } else {
        this.errorMessage = "No results found for this pincode.";
      }

    });

  }

}