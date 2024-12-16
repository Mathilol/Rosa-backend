import {Prop, SchemaFactory, Schema} from "@nestjs/mongoose";

@Schema({ collection: 'appointment'})
export class Appointment {
  @Prop() startDate: Date;
  @Prop() endDate: Date;
  @Prop() healthProfessionalId: number;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
