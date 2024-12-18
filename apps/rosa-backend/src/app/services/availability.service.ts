import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../repository/appointment.repository';
import { ScheduleRepository } from '../repository/schedule.repository';
import { Schedule } from '../object/schema/schedule';
import { AvailabilityDto } from '../object/dto/availability.dto';
import {
  addDays,
  isBefore,
  isAfter,
  differenceInMinutes,
  addMinutes,
  addYears,
  startOfDay,
  endOfDay,
  format,
} from 'date-fns';
import { Days } from '../object/days';
import { Availability } from '../object/availability';
import { Appointment } from '../object/schema/appointment';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly scheduleRepository: ScheduleRepository
  ) {}

  public async getAvailabilities(
    from: Date,
    to: Date
  ): Promise<AvailabilityDto[]> {
    const schedules: Schedule[] = await this.scheduleRepository.findAllForHP(1);
    const appointments: Appointment[] =
      await this.appointmentRepository.findAllForHP(1, from, to);
    let availabilityDtos: AvailabilityDto[] =
      this.calculateAvailabilitiesFromSchedules(from, to, schedules);

    appointments.forEach((app) => {
      availabilityDtos.forEach((availabilityDto) => {
        availabilityDto.availabilities = availabilityDto.availabilities.flatMap(
          (availability) => {
            if (
              isAfter(app.startDate, availability.startDate) &&
              isBefore(app.startDate, availability.endDate)
            ) {
              const availabilities: Availability[] = [
                { startDate: availability.startDate, endDate: app.startDate },
              ];

              if (isBefore(app.endDate, availability.endDate)) {
                availabilities.push({
                  startDate: app.endDate,
                  endDate: availability.endDate,
                });
              }

              return availabilities;
            } else if (
              isAfter(app.endDate, availability.startDate) &&
              isBefore(app.endDate, availability.endDate)
            ) {
              const availabilities: Availability[] = [
                { startDate: app.endDate, endDate: availability.endDate },
              ];

              if (isAfter(app.startDate, availability.startDate)) {
                availabilities.unshift({
                  startDate: availability.startDate,
                  endDate: app.startDate,
                });
              }
              return availabilities;
            } else if (
              isBefore(app.startDate, availability.startDate) &&
              isAfter(app.endDate, availability.endDate)
            ) {
              return [];
            }
            return [availability];
          }
        );
      });
    });

    availabilityDtos.forEach((availabilityDto) => {
      availabilityDto.availabilities = availabilityDto.availabilities.flatMap(
        (availability) => this.splitAvailability(availability, 15)
      );
    });

    return availabilityDtos;
  }

  public async getNextAvailability(
    from: Date
  ): Promise<Availability | undefined> {
    let date: Date = from;
    const maxDate: Date = addYears(from, 1);

    while (isBefore(date, maxDate)) {
      const availabilitesDtos: AvailabilityDto[] = await this.getAvailabilities(
        date,
        addDays(date, 7)
      );
      const availabilites: Availability[] = availabilitesDtos.flatMap(
        (a) => a.availabilities
      );

      if (availabilites.length > 0) {
        return availabilites.reduce((previousValue, newValue) =>
          isAfter(newValue.startDate, previousValue.startDate)
            ? previousValue
            : newValue
        );
      }
    }

    return;
  }

  private calculateAvailabilitiesFromSchedules(
    fromDate: Date,
    endDate: Date,
    schedules: Schedule[]
  ): AvailabilityDto[] {
    const availabilityDtos: AvailabilityDto[] = [];
    let currentDate: Date = startOfDay(fromDate);
    endDate = endOfDay(endDate);

    while (currentDate.getTime() <= endDate.getTime()) {
      const schedule: Schedule = schedules.find((s) =>
        s.days.includes(Days[currentDate.getDay()])
      );
      if (schedule) {
        const dateString = format(currentDate, 'yyyy-MM-dd');
        availabilityDtos.push({
          availabilities: [
            {
              startDate: new Date(`${dateString}T${schedule.startTime}:00`),
              endDate: new Date(`${dateString}T${schedule.endTime}:00`),
            },
          ],
          date: startOfDay(currentDate),
        });
      }
      currentDate = addDays(currentDate, 1);
    }
    return availabilityDtos;
  }

  private splitAvailability(
    availability: Availability,
    chunkSize: number
  ): Availability[] {
    const availabilities: Availability[] = [];
    const totalMinutes: number = differenceInMinutes(
      availability.endDate,
      availability.startDate
    );
    const numberOfChunks: number = Math.floor(totalMinutes / chunkSize);

    for (let i = 0; i < numberOfChunks; i++) {
      const start: Date = addMinutes(availability.startDate, i * chunkSize);
      const end: Date = addMinutes(start, chunkSize);
      availabilities.push({ startDate: start, endDate: end });
    }

    return availabilities;
  }
}
