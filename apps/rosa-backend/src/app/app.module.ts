import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {MongooseModule} from "@nestjs/mongoose";
import {AppointmentModule} from "./module/appointment.module";
import {ScheduleModule} from "./module/schedule.module";
import {AvailabilityService} from "./services/availability.service";
import {AvailabilityController} from "./controller/availability.controller";

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/Rosa'),
    AppointmentModule,
    ScheduleModule
  ],
  controllers: [
    AppController,
    AvailabilityController
  ],
  providers: [
    AppService,
    AvailabilityService
  ],
})
export class AppModule {
}
