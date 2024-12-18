import {Prop, SchemaFactory, Schema} from "@nestjs/mongoose";

@Schema({ collection: 'health_professional'})
export class HealthProfessional {
  @Prop() name: String;
}

export const healthProfessionalSchema = SchemaFactory.createForClass(HealthProfessional);
