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

    const url = "https://api.postalpincode.in/pincode/" + this.pincode;

    this.http.get<any>(url).subscribe(response => {

      if (response[0].Status === "Success") {
        this.postOffices = response[0].PostOffice;
      } else {
        alert("Invalid Pincode");
        this.postOffices = [];
      }

    });

  }

}