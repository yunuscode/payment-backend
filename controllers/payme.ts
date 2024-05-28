import { Response, Request } from "express";
import prisma from "@prisma/index";

export async function paymeGateway(request: Request, response: Response) {
  const authorization = request.headers["authorization"];

  if (authorization !== process.env.PAYME_HEADER) {
    return response
      .status(200)
      .json(createError(-32504, "You don't have access to send request"));
  }

  const method = request.body.method;

  console.log(method);

  if (!method) {
    return response.status(400).send("BAD REQUEST");
  }

  if (method == "CheckPerformTransaction") {
    const amount = request.body.params.amount;
    const order_id = request.body.params.account.order_id;

    if (!amount || !order_id) {
      return response.status(400).send("BAD REQUEST");
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: order_id,
      },
    });

    if (!invoice) {
      return response.status(200).json(createError(-31050, "Order not found"));
    }

    if (invoice.status !== "created") {
      console.log("Invoice is paid");
      return response.status(200).json(createError(-31050, "Order not found"));
    }

    if (invoice.amount * 100 !== amount) {
      return response.status(200).json(createError(-31001, "Order not found"));
    }

    return response.status(200).json({
      result: {
        allow: true,
      },
    });
  }

  if (method == "CreateTransaction") {
    const amount = request.body.params.amount;
    const order_id = request.body.params.account.order_id;

    if (!amount || !order_id) {
      return response.status(400).send("BAD REQUEST");
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        AND: [
          { id: order_id },
          {
            status: "created",
          },
        ],
      },
    });

    if (!invoice) {
      return response.status(200).json(createError(-31050, "Order not found"));
    }

    if (invoice.status !== "created") {
      return response.status(200).json(createError(-31050, "Order not found"));
    }

    if (invoice.amount * 100 !== amount) {
      return response
        .status(200)
        .json(createError(-31001, "Price doesn't match"));
    }

    const transactionId = request.body.params.id;
    const transactionCreateTime = request.body.params.time;

    const existingTransaction = await prisma.paymeTransactions.findFirst({
      where: {
        id: transactionId,
      },
    });

    const otherTransactions = await prisma.paymeTransactions.findFirst({
      where: {
        AND: [
          {
            invoiceId: invoice.id,
          },
          {
            NOT: {
              id: transactionId,
            },
          },
        ],
      },
    });

    if (otherTransactions) {
      return response.json(createError(-31099, "in_proccess"));
    }

    let transaction = existingTransaction;

    if (!existingTransaction) {
      transaction = await prisma.paymeTransactions.create({
        data: {
          id: transactionId,
          create_time: transactionCreateTime,
          invoiceId: invoice.id,
        },
      });
    }

    if (transaction) {
      return response.json({
        result: {
          create_time: parseInt(transaction.create_time.toString()),
          transaction: transaction.transaction,
          state: transaction.state,
        },
      });
    }

    if (!transaction) {
      response.json(createError(-31050, "Transaction not found"));
    }
  }

  if (method == "CheckTransaction") {
    const transactionId = request.body.params.id;

    const transaction = await prisma.paymeTransactions.findFirst({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) {
      return response.json(createError(-31003, "Transaction is not found"));
    }

    return response.json({
      result: {
        create_time: parseInt(transaction.create_time.toString()),
        perform_time: transaction.perform_time
          ? parseInt(transaction.perform_time.toString())
          : 0,
        cancel_time: transaction.cancel_time
          ? parseInt(transaction.cancel_time.toString())
          : 0,
        transaction: transaction.transaction,
        state: transaction.state,
        reason: transaction.reason?.length
          ? parseInt(transaction.reason)
          : null,
      },
    });
  }

  if (method == "PerformTransaction") {
    const transactionId = request.body.params.id;

    const transaction = await prisma.paymeTransactions.findFirst({
      where: {
        id: transactionId,
      },
      include: {
        invoice: true,
      },
    });

    if (!transaction) {
      return response.json(createError(-31003, "Transaction is not found"));
    }

    const performTime =
      transaction.perform_time?.toString() &&
      transaction.perform_time?.toString() !== "0"
        ? parseInt(transaction.perform_time?.toString())
        : Date.now();

    await prisma.paymeTransactions.update({
      data: {
        state: 2,
        perform_time: performTime,
      },
      where: {
        id: transactionId,
      },
    });

    await prisma.invoice.update({
      data: {
        status: "paid",
      },
      where: {
        id: transaction.invoice.id,
      },
    });

    return response.json({
      result: {
        transaction: transaction.transaction,
        perform_time: performTime,
        state: 2,
      },
    });
  }

  if (method == "CancelTransaction") {
    const transactionId = request.body.params.id;

    const transaction = await prisma.paymeTransactions.findFirst({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) {
      return response.json(createError(-31003, "Transaction is not found"));
    }

    const cancelTime =
      transaction.cancel_time?.toString() &&
      transaction.cancel_time?.toString() !== "0"
        ? parseInt(transaction.cancel_time?.toString())
        : Date.now();

    await prisma.paymeTransactions.update({
      data: {
        state: -1,
        cancel_time: cancelTime,
        reason: `${request.body.params.reason}`,
      },
      where: {
        id: transactionId,
      },
    });

    return response.json({
      result: {
        transaction: transaction.transaction,
        cancel_time: cancelTime,
        state: -1,
      },
    });
  }

  /**
   * GetStatement
   * from: 1622505600
   * to: 1622592000
   *
   */

  if (method == "GetStatement") {
    const from = request.body.params.from;
    const to = request.body.params.to;

    const transactions = await prisma.paymeTransactions.findMany({
      where: {
        AND: [
          {
            create_time: {
              gte: from,
              lte: to,
            },
          },
          {
            perform_time: {
              not: null,
            },
          },
        ],
      },
      include: {
        invoice: true,
      },
    });

    const result = transactions
      .map((transaction) => {
        return {
          id: transaction.id,
          time: parseInt(transaction.create_time.toString()),
          amount: transaction.invoice.amount * 100,
          account: {
            order_id: transaction.invoice.id,
          },
          create_time: parseInt(transaction.create_time.toString()),
          transaction: transaction.transaction,
          state: transaction.state,
          perform_time: transaction.perform_time
            ? parseInt(transaction.perform_time.toString())
            : 0,
          cancel_time: transaction.cancel_time
            ? parseInt(transaction.cancel_time.toString())
            : 0,
          reason: transaction.reason ? parseInt(transaction.reason) : null,
        };
      })
      .filter((transaction) => transaction.perform_time > 0);

    return response.json({
      result: {
        transactions: result,
      },
    });
  }
}

function createError(code: number, message: string) {
  return {
    error: {
      code: code,
      message: {
        ru: message,
        uz: message,
        en: message,
      },
    },
    id: 2032,
  };
}
