const User = require("../models/user");
const sequelize_db = require("../util/expense");
const Expense = require("../models/expense");

exports.createExpenseController = async (req, res) => {
  const t = await sequelize_db.transaction();
  const { amount, description, category } = req.body;

  try {
    if (
      amount === undefined ||
      description === undefined ||
      category === undefined
    ) {
      console.log(amount, description, category);
      return res.status(400).json({ error: "Fill all fields" });
    } else {
      const ExpenseData = await Expense.create(
        {
          amount: amount,
          description: description,
          category: category,
          userId: req.user.id,
        },
        {
          transaction: t,
        }
      );

      const user = await User.findByPk(req.user.id);
      if (!user) {
        throw new Error("user not found");
      }
      const totalExpense = Number(user.totalExpense) + Number(amount);
      console.log("totalExpense>>>", totalExpense);
      await User.update(
        {
          totalExpense: totalExpense,
        },
        { where: { id: req.user.id }, transaction: t }
      );
      await t.commit();
      res.status(201).json({ Expense: totalExpense });
    }
  } catch (err) {
    console.log("error" + err);
    await t.rollback();
    res.status(500).json({ error: err });
  }
};

exports.getExpenseController = async (req, res) => {
  try {
    const data = await Expense.findAll({ where: { userId: req.user.id } });
    res.status(200).json({ expense: data });
  } catch (err) {
    console.log("something went wrong", err);
  }
};
exports.deleteExpense = async (req, res) => {
  try {
    const uId = req.params.id;
    console.log(uId);
    if (uId == "undefined" || uId.length === 0) {
      console.log("ID is missing");
      return res.status(400).json({ success: false });
    }

    const userTotalExpense = await User.findAll({ where: { id: req.user.id } });
    let new_Expense;
    try {
      console.log("Expenses >>>", userTotalExpense);
      userTotalExpense.forEach((expense) => {
        console.log("userTotalExpense >>>", expense.totalExpense);
        new_Expense = expense.totalExpense;
      });
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }

    console.log("Expenses >>>", new_Expense);

    let deleteditemprice;
    const getDeletedExpense = await Expense.findAll({
      where: { id: uId, userId: req.user.id },
    });
    try {
      getDeletedExpense.forEach((expense) => {
        console.log("getDeletedExpense>>>", expense.amount);
        deleteditemprice = expense.amount;
      });
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }

    let updatedTotalExpense = new_Expense - deleteditemprice;
    console.log("updatedTotalExpense>>>", updatedTotalExpense);
    const noofrows = await Expense.destroy({
      where: { id: uId, userId: req.user.id },
    });

    await User.update(
      { totalExpense: updatedTotalExpense },
      { where: { id: req.user.id } }
    );
    console.log("noofrows", noofrows);
    if (noofrows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Expense doenst belong to the user" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Deleted Successfuly" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: true, message: "Failed" });
  }
};
//second method**************
// exports.deleteExpense = async (req, res) => {
//   const t = await sequelize_db.transaction();
//   const uId = req.params.id;
//   try {
//     if (uId === undefined) {
//       console.log("id is missing");
//       res.status(400).json({ error: "ID is missing" });
//       return res.status(400).json({ success: false });
//     }
//     const noofrows = await Expense.destroy({
//       where: { id: uId, userId: req.user.id },
//     });
//     console.log("noofrows", noofrows);
//     // ****delete from user table
//     const user = await User.findOne({ where: { id: req.user.id } });
//     const expense = await Expense.findOne({
//       where: { id: uId, userId: req.user.id },
//     });
//     const totalExpense = user.totalExpense - user.amount;
//     await User.update(
//       {
//         totalExpense: totalExpense,
//       },
//       { where: { id: req.user.id }, transaction: t }
//     );
//     await t.commit();
//     await Expense.destroy({ where: { id: uId, userId: req.user.id } });
//     {
//       res.status(204).send();
//     }
//   } catch (error) {
//     await t.rollback();
//     console.error(error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

//   if (noofrows === 0) {
//     return res.status(404).json({
//       success: false,
//       message: "Expense doesnt belongs to the user",
//     });
//   }

//       return res
//     .status(200)
//     .json({ success: true, message: "Deleted Successfuly" });
// } catch (err) {
//   console.log(err);
//   return res.status(500).json({ success: true, message: "Failed" });
// }
// };

// ****delete from user table
//     const user = await User.findOne({ where: { id: req.user.id } });
//     const expense = await Expense.findOne({
//       where: { id: uId, userId: req.user.id },
//     });
//     const totalExpense = user.totalExpense - expense.amount;
//     await User.update(
//       {
//         totalExpense: totalExpense,
//       },
//       { where: { id: req.user.id }, transaction: t }
//     );
//     await t.commit();
//     await Expense.destroy({ where: { id: uId, userId: req.user.id } });
//     {
//       res.status(204).send();
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };
