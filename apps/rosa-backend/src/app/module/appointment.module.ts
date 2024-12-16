import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {Appointment, AppointmentSchema} from "../object/schema/appointment";

import {AppointmentRepository} from "../repository/appointment.repository";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }])],
  providers: [
    AppointmentRepository
  ],
  exports: [AppointmentRepository]
})
export class AppointmentModule {}
