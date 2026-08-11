import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReservationStatus } from '../enums/reservation-status.enum';

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatus)
  @IsNotEmpty()
  status: ReservationStatus;
}
