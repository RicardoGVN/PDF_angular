import { Component, OnInit } from "@angular/core";
import * as jsPDF from "jspdf";
import * as html2canvas from "html2canvas";
import * as mustache from "mustache";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  title = "CodeSandbox";
  pdf: jsPDF;
  pdfSrc: any;
  pdfData: any;
  pdfPage = 1;

  async ngOnInit() {
    window["html2canvas"] = html2canvas;
    console.time("template");
    const template = await this.getTemplate();
    console.timeEnd("template");
    console.time("model");
    const model = await this.getModel();
    console.timeEnd("model");
    console.time("mustache");
    const html = mustache.render(template, model);
    console.timeEnd("mustache");
    this.pdf = new jsPDF({
      unit: "pt",
      format: "a4",
      orientation: "portrait"
    });

    console.time("generate");
    this.pdf.html(html, {
      html2canvas: {
        useCORS: true,
        scale: 0.475
      },
      callback: result => {
        console.timeEnd("generate");
        this.pdfData = result;
        this.pdfSrc = result.output("arraybuffer");
      }
    });
  }

  async getTemplate(): Promise<string> {
    return await (await fetch("../assets/template.html")).text();
  }

  async getModel(): Promise<object> {
    const response = await fetch("https://randomuser.me/api/?gender=female");
    const data = await response.json();
    const user = data.results.pop();

    return {
      ProfileFirstName: `${user.name.title} ${user.name.first} ${
        user.name.last
      }`,
      ProfileHeadline: "Senior Software Engineer",
      ProfilePictureUrl: "../assets/unknown.png", // `${user.picture.thumbnail}`,
      ProfesionalExperience: [
        {
          Role: "Technical Lead",
          CompanyName: "Miele",
          City: "New York",
          Years: 5,
          Activities: [
            "Reworked frontend framework",
            "Added new authorization platform"
          ]
        },
        {
          Role: "Fullstack Developer",
          CompanyName: "IGN",
          City: "Los Angeles",
          Years: 5,
          Activities: [
            "Reworked frontend framework",
            "Added new authorization platform"
          ]
        }
      ],
      EducationsThreeMostRecent: [
        {
          Institution: "Caltech",
          Name: "Artificial Intelligence",
          Years: 4
        },
        {
          Institution: "Caltech",
          Name: "Software Design",
          Years: 1
        }
      ]
    };
  }

  onDownloadClicked(): void {
    this.pdfData.save();
  }
}
