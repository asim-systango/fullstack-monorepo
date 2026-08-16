/**
 * CMS role names mapped to gateway JWT role values.
 * DB/JWT still store: user | staff | admin
 */
export enum Role {
  Author = 'user',
  Editor = 'staff',
  Admin = 'admin',
}
