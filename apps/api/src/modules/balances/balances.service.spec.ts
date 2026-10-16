import { applySettlementToNets, BalancesService } from './balances.service';

describe('BalancesService settlement math', () => {
  const service = Object.create(BalancesService.prototype) as BalancesService;

  it('caps outstanding to the overlapping debtor/creditor nets', () => {
    const outstanding = service.outstandingBetween(
      [
        { userId: 'bob', netCents: -5000 },
        { userId: 'alice', netCents: 3000 },
      ],
      'bob',
      'alice',
    );
    expect(outstanding).toBe(3000);
  });

  it('returns 0 when payer is not in debt or payee is not owed', () => {
    expect(
      service.outstandingBetween(
        [
          { userId: 'bob', netCents: 100 },
          { userId: 'alice', netCents: 3000 },
        ],
        'bob',
        'alice',
      ),
    ).toBe(0);
  });
});

describe('applySettlementToNets', () => {
  it('clears a pairwise debt when the debtor pays the creditor in full', () => {
    const nets = new Map([
      ['alice', 5000],
      ['bob', -5000],
    ]);

    applySettlementToNets(nets, 'bob', 'alice', 5000);

    expect(nets.get('alice')).toBe(0);
    expect(nets.get('bob')).toBe(0);
  });

  it('reduces remaining debt after a partial payment', () => {
    const nets = new Map([
      ['himesh', 3000],
      ['demo-user', -3000],
    ]);

    applySettlementToNets(nets, 'demo-user', 'himesh', 900);

    expect(nets.get('himesh')).toBe(2100);
    expect(nets.get('demo-user')).toBe(-2100);
  });
});
