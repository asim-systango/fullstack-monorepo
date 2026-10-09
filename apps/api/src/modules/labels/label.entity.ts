import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'labels' })
@Unique('uq_label_name', ['projectId', 'name'])
export class Label {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'project_id', type: 'uuid' }) projectId!: string;
  @Column() name!: string;
  @Column({ default: '#888888' }) color!: string;
}
