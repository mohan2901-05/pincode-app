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
  loading: boolean = false;

  constructor(private http: HttpClient) {}

  getPincodeDetails() {

    // Validate pincode
    if (this.pincode.length !== 6) {
      alert("Please enter a valid 6-digit pincode");
      return;
    }

    this.loading = true;

    const url = "https://api.postalpincode.in/pincode/" + this.pincode;

    this.http.get<any>(url).subscribe(response => {

      this.loading = false;

      if (response[0].Status === "Success") {
        this.postOffices = response[0].PostOffice;
      } else {
        alert("Invalid Pincode");
        this.postOffices = [];
      }

    });

  }

}