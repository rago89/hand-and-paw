/* eslint-disable no-underscore-dangle */

const Users = require("../models/user-register");

const databaseAccess = {
  create: async (newUser) => {
    const user = new Users(newUser);
    const savedUser = await user.save();

    const returnUser = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
    };
    return returnUser;
  },

  update: async (newData, userAvatar) => {
    const subscriber = await Users.find({ _id: newData.id });

    if (subscriber.length === 0) {
      throw new Error(`Cannot update user, id doesn't exist`);
    }
    const subscriberUpdated = Users.updateOne(
      { _id: newData.id },
      {
        $set: {
          name: newData.name,
          password: newData.password,
          location: newData.location,
          phone: newData.phone,
          email: newData.email,
          avatar: userAvatar,
          updateDate: Date.now(),
          publicAccess: {
            monday: {
              access: newData["monday-access"],
              hours: newData["monday-hours"],
            },
            tuesday: {
              access: newData["tuesday-access"],
              hours: newData["tuesday-hours"],
            },
            wednesday: {
              access: newData["wednesday-access"],
              hours: newData["wednesday-hours"],
            },
            thursday: {
              access: newData["thursday-access"],
              hours: newData["thursday.hours"],
            },
            friday: {
              access: newData["friday-access"],
              hours: newData["friday-hours"],
            },
            saturday: {
              access: newData["saturday-access"],
              hours: newData["saturday-hours"],
            },
            sunday: {
              access: newData["sunday-access"],
              hours: newData["sunday-hours"],
            },
          },
        },
      }
    );
    return subscriberUpdated;
  },

  remove: async (id) => {
    let removeUser = await Users.deleteOne({ _id: id });
    if (removeUser.deletedCount === 0) {
      throw new Error(`Cannot delete user, id doesn't exist`);
    }

    if (removeUser.deletedCount === 1) {
      removeUser = `User, with the id: '${id}' removed successfully`;
    }
    return removeUser;
  },

  read: async (id = "") => {
    const subscriber = await Users.find({ _id: id });

    if (subscriber.length === 0) {
      throw Error(`Cannot find user, id doesn't exist`);
    }
    return subscriber;
  },

  all: async () => {
    let subscribers = await Users.find();
    if (subscribers.length === 0) {
      subscribers = `there are not users in users collection`;
    }
    return subscribers;
  },

  findUserByEmail: async (userEmail) => {
    const subscriber = await Users.find({ email: userEmail }, "email");
    return subscriber;
  },
  findUserLog: async (userEmail, userPassword) => {
    const subscriber = await Users.find({
      email: userEmail,
      password: userPassword,
    });
    return subscriber;
  },
};

module.exports = databaseAccess;
