import { CommonModule } from '@angular/common';
import {ChangeDetectionStrategy, Component, AfterViewInit, ChangeDetectorRef} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS} from '@angular/material/dialog';

/**
 * @title Dialog with header, scrollable content and actions
 */
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})



export class DialogContentExampleDialog {

  currentMessage: { description: string } | null = null;

  messages = [
    { description: '🙂 1 persona ha realizado una compra recientemente. 3min' },
    { description: '🙂 han reservado recientemente 2dos numeros. 2min ' },
    { description: '😉 La rifa esta pronto a culminar, APRESURATE. 1min' },
    { description: '🙂 2 persona ha realizado una compra recientemente. 2min' },
    { description: '🙂 han reservado recientemente 6seis numeros. 2min ' },
    { description: '😉 La rifa esta pronto a culminar, AÚN ESTAS A TIEMPO. 1min' },
    { description: '🙂 han reservado recientemente 3tres numeros. 2min ' },
    { description: '🙂 5 persona ha realizado una compra recientemente. 1min' },
    { description: '🙂 han reservado recientemente 8ocho numeros. 2min ' },
    { description: '🙂 3 persona ha realizado una compra recientemente. 1min' },
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.startToastLoop();
  }

 
  startToastLoop() {
    let index = 0;
    const toastElement = document.getElementById('liveToast');

    setInterval(() => {
      this.currentMessage = this.messages[index];

      // Forzar la detección de cambios en Angular
      this.cdr.detectChanges();

      if (toastElement) {
        const bootstrapToast = new (window as any).bootstrap.Toast(toastElement);
        bootstrapToast.show();
      }

      index = (index + 1) % this.messages.length;
    }, 10000);
  }


}