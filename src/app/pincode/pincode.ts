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

  constructor(private http: HttpClient) {}

  getPincodeDetails() {

    if (this.pincode.length !== 6) {
      alert("Please enter a valid 6-digit pincode");
      return;
    }

    const url = "https://api.postalpincode.in/pincode/" + this.pincode;

    this.http.get<any>(url).subscribe({

      next: (response) => {

        if (response[0].Status === "Success") {
          this.postOffices = response[0].PostOffice;
        } else {
          alert("Invalid Pincode");
          this.postOffices = [];
        }

      },

      error: (error) => {
        console.error(error);
        alert("Unable to fetch data");
      }

    });

  }

}