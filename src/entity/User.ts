import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import bcrypt from "bcrypt";

import { PasswordEncryption } from "./../app/utils/";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 60,
  })
  username: string;

  @Column({
    type: "varchar",
    length: 100,
    unique: true,
    // select: false,
  })
  email: string;

  @CreateDateColumn({
    type: "timestamp",
    select: false,
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "timestamp",
    select: false,
  })
  updated_at: Date;

  @Column({
    type: "varchar",
    select: false,
  })
  password: string;

  @Column({
    type: "varchar",
    default: "Guest", //If you want give [admin, master,student] role for each user, just change "Guest" to ["Admin", "Master", "Student"]
  })
  role: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      this.password = await PasswordEncryption(this.password);
    }
  }

  checkUserPasswordCrypt(onencryptedPassword: string) {
    return bcrypt.compareSync(onencryptedPassword, this.password);
  }
}
