import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AvailabilityService } from '../services/availability.service';
import { DateRangeDto } from '../object/dto/dateRange.dto';
import { addDays, isAfter, startOfDay } from 'date-fns';
import { validateOrReject } from 'class-validator';
import { Availability } from '../object/availability';
import { AvailabilityDto } from '../object/dto/availability.dto';

@Controller('availabilities')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAvailabilities(@Query() dateRangeDto: DateRangeDto) {
    await validateOrReject(dateRangeDto);
    const fromDate: Date = new Date(dateRangeDto.fromDate);
    const toDate: Date = new Date(dateRangeDto.toDate);

    if (isAfter(fromDate, toDate)) {
      throw new BadRequestException('The fromDate cannot be after the toDate');
    }

    const availabilityDtos: AvailabilityDto[] =
      await this.availabilityService.getAvailabilities(fromDate, toDate);
    const nextAvailability: Availability = await this.getNextAvailability(
      addDays(toDate, 1).toISOString()
    );

    return {
      availabilities: availabilityDtos,
      hasFutureAvailabilities: !!nextAvailability,
      upcomingAvailabilityDate: startOfDay(nextAvailability.startDate),
    };
  }

  @Get('next-availability')
  async getNextAvailability(@Query('after') after: string) {
    const afterDate: Date = new Date(after);
    const availability: Availability =
      await this.availabilityService.getNextAvailability(afterDate);

    if (!availability) {
      throw new NotFoundException(
        'No availability found in the upcoming year.'
      );
    }

    return availability;
  }
}
