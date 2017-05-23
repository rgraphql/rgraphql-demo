import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { SocketBusService } from './services/socket-bus/socket-bus';
import { SoyuzService } from './services/soyuz';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
  ],
  providers: [
    SocketBusService,
    SoyuzService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
