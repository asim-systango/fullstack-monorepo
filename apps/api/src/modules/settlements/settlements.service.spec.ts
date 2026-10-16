import { ForbiddenException } from '@nestjs/common';
import { assertActorIsSettlementPayee } from './settlements.service';

describe('assertActorIsSettlementPayee', () => {
  const actor = 'user-himesh';

  it('allows the logged-in user to settle when they are the payee', () => {
    expect(() => assertActorIsSettlementPayee(actor, actor)).not.toThrow();
  });

  it('rejects settling money the logged-in user owes', () => {
    expect(() => assertActorIsSettlementPayee(actor, 'creditor-id')).toThrow(
      ForbiddenException,
    );
  });

  it('rejects settling a debt between other members', () => {
    expect(() => assertActorIsSettlementPayee(actor, 'other-payee')).toThrow(
      ForbiddenException,
    );
  });
});
