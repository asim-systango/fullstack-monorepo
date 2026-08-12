import { Controller, Get, Param, ParseUUIDPipe, Header } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FhirService } from './fhir.service';
import { CurrentUser, JwtUser, Roles } from '../../common/auth';

@ApiTags('Export')
@Controller('appointments')
export class ExportController {
  constructor(private readonly fhirService: FhirService) {}

  @Get(':id/fhir')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  @ApiOperation({
    summary: 'Export patient clinical appointment record in HL7 FHIR R4 JSON format',
  })
  @ApiResponse({ status: 200, description: 'FHIR R4 JSON bundle generated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — Record ownership required' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async exportFhir(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    return this.fhirService.generateFhirBundle(id, user);
  }

  @Get(':id/hl7')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  @Header('Content-Type', 'text/plain')
  @ApiOperation({
    summary: 'Export patient clinical appointment record in HL7 v2.5 ORU^R01 text format',
  })
  @ApiResponse({ status: 200, description: 'HL7 v2.5 text generated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — Record ownership required' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async exportHl7(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser | undefined,
  ): Promise<string> {
    return this.fhirService.generateHl7Message(id, user);
  }
}
