import { OrderPaymentStatus } from './order.entity';
import { PaymentStatus } from './payment.entity';
import { PaymentsService } from './payments.service';

jest.mock('../../config/razorpay.config', () => ({
  razorpayConfig: () => ({
    keyId: '',
    keySecret: '',
    enabled: false,
    tlsInsecure: false,
  }),
}));

const CUSTOMER = {
  id: 'user-1',
  email: 'customer@tastygo.com',
  role: 'user' as const,
};

function lockQb<T>(row: T) {
  return {
    setLock: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(row),
  };
}

describe('PaymentsService', () => {
  const paymentRepo = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    save: jest.fn(),
    create: jest.fn((row) => row),
  };
  const orderRepo = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    save: jest.fn(),
  };
  const manager = {
    getRepository: jest.fn((entity: { name?: string }) => {
      const name = typeof entity === 'function' ? entity.name : '';
      if (name === 'Payment') return paymentRepo;
      return orderRepo;
    }),
  };
  const dataSource = {
    transaction: jest.fn(async (fn: (m: typeof manager) => Promise<unknown>) => fn(manager)),
  };

  let service: PaymentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource.transaction.mockImplementation(async (fn) => fn(manager));
    service = new PaymentsService(dataSource as never, paymentRepo as never, orderRepo as never);
  });

  it('returns already-paid without writing again', async () => {
    orderRepo.findOne.mockResolvedValue({
      id: 'order-1',
      userId: CUSTOMER.id,
      paymentStatus: OrderPaymentStatus.PAID,
      total: 100,
    });

    await expect(
      service.verifyPayment(
        'order-1',
        {
          razorpayOrderId: 'order_mock_1',
          razorpayPaymentId: 'pay_1',
          razorpaySignature: 'sig',
        },
        CUSTOMER,
      ),
    ).resolves.toEqual({
      orderId: 'order-1',
      paymentStatus: OrderPaymentStatus.PAID,
      message: 'Already paid',
    });
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('is idempotent when a concurrent verify already captured payment', async () => {
    orderRepo.findOne.mockResolvedValue({
      id: 'order-1',
      userId: CUSTOMER.id,
      paymentStatus: OrderPaymentStatus.PENDING,
      total: 100,
    });
    paymentRepo.findOne.mockResolvedValue({
      id: 'pay-row',
      orderId: 'order-1',
      providerOrderId: 'order_mock_1',
      status: PaymentStatus.CREATED,
    });
    orderRepo.createQueryBuilder.mockReturnValue(
      lockQb({
        id: 'order-1',
        paymentStatus: OrderPaymentStatus.PAID,
      }),
    );

    await expect(
      service.verifyPayment(
        'order-1',
        {
          razorpayOrderId: 'order_mock_1',
          razorpayPaymentId: 'pay_1',
        },
        CUSTOMER,
      ),
    ).resolves.toMatchObject({
      orderId: 'order-1',
      paymentStatus: OrderPaymentStatus.PAID,
      message: 'Already paid',
    });
    expect(orderRepo.save).not.toHaveBeenCalled();
  });
});
