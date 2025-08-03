import { CommonModule } from '@angular/common';
import {ChangeDetectionStrategy, Component, AfterViewInit, ChangeDetectorRef} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS} from '@angular/material/dialog';

/**
 * @title Dialog with header, scrollable content and actions
 */
@Component({
  selector: 'app-terminosycondiciones',
  templateUrl: './terminosycondiciones.component.html',
  styleUrls: ['./terminosycondiciones.component.css'],
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})



export class TerminosycondicionesContentExampleDialog {



  ngOnInit() {
  }

 


}