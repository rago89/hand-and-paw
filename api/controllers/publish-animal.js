/* eslint-disable no-undefined */
/* eslint-disable no-underscore-dangle */

const animalManager = require("../business-logic/publish-animal");
// const animalDbAccess = require("../data-access/publish-animal");
const userDbAccess = require("../data-access/user-register");
const deleteImage = require("../utils/delete-image");

const personPublication = {
  getAllAnimals: async (req, res) => {
    try {
      const animals = await animalManager.getAllAnimals();
      res.status(200).send(animals);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getAnimal: async (req, res) => {
    try {
      const { id } = req.params;
      if ([...id].length !== 24) {
        throw new Error(`invalid id`);
      }
      const animal = await animalManager.getAnimal(id);
      res.status(200).send(animal);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  },
  updateAnimal: async (req, res) => {
    try {
      const { id } = req.params;
      const newData = req.body;
      // check user id
      if ([...newData.userId].length !== 24) {
        throw new Error(`invalid id`);
      }

      // check if subscriber exists
      const user = await userDbAccess.read(newData.userId);

      if (user.length === 0) {
        throw new Error(`cannot update animal user doesn't exist`);
      }

      if (req.files !== undefined) {
        await animalManager.updateAnimal(newData, req.files, id);
        const animalUpdated = await animalManager.getAnimal(id);
        res.status(200).send(animalUpdated);
        return;
      }

      await animalManager.updateAnimal(newData);
      const animalUpdated = await animalManager.getAnimal(id);
      res.status(200).send(animalUpdated);
    } catch (error) {
      // if any error ,make sure multer doesn't store image
      if (req.files) {
        const pictures = req.files;
        for (const picture in pictures) {
          deleteImage.deleteImageSync(
            pictures[picture][0].filename,
            "animal-uploads"
          );
        }
      }
      res.status(401).json({ message: error.message, stack: error.stack });
    }
  },
  deleteAnimal: async (req, res) => {
    try {
      const { id } = req.params;
      if ([...id].length !== 24) {
        throw new Error(`invalid id`);
      }
      const userDeleted = await animalManager.removeAnimal(id);
      res.status(200).send(userDeleted);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  postAnimal: async (req, res) => {
    try {
      const { body } = req;
      const { userId } = body;
      if ([...userId].length !== 24) {
        throw new Error(`invalid id`);
      }
      // check if subscriber exists
      const subscriber = await userDbAccess.read(userId);
      if (subscriber.length === 0) {
        throw new Error(`cannot publish animal user doesn't exist`);
      }
      body.pictures = [];
      const newPublication = await animalManager.createAnimal(body, req.files);
      // add the animal to the subscriber.publications
      if (newPublication.length !== 0) {
        await userDbAccess.updateUserPublication(
          newPublication._id,
          subscriber[0]._id
        );
      }
      res.status(201).json(newPublication);
    } catch (error) {
      if (req.files) {
        const pictures = req.files;
        for (const picture in pictures) {
          deleteImage.deleteImageSync(
            pictures[picture][0].filename,
            "animal-uploads"
          );
        }
      }
      res.status(400).json({ message: error.message });
    }
  },
  updateOnePictureAnimal: async (req, res) => {
    try {
      const { animalId } = req.params;
      const { pictureId } = req.body;

      if ([...animalId].length !== 24 || [...pictureId].length !== 24) {
        throw new Error(`invalid id`);
      }
      // if there is an image uploaded
      const updatePicture = await animalManager.updateOnePicture(
        animalId,
        pictureId,
        req.file.filename
      );
      if (
        updatePicture.acknowledged === true &&
        updatePicture.modifiedCount === 1
      ) {
        res.status(200).json({ message: "picture updated successfully" });
      }
    } catch (error) {
      if (req.file) {
        await deleteImage.deleteImageAsync(req.file.filename, "animal-uploads");
      }
      res.status(400).json({ message: error.message });
    }
  },
  deleteOnePictureAnimal: async (req, res) => {
    try {
      const { animalId } = req.params;
      const { pictureId } = req.body;
      if ([...animalId].length !== 24 || [...pictureId].length !== 24) {
        throw new Error(`invalid id`);
      }
      const deletePicture = await animalManager.deleteOnePicture(
        animalId,
        pictureId
      );
      res.status(200).json(deletePicture);
    } catch (error) {
      if (req.file) {
        await deleteImage.deleteImageAsync(req.file.filename, "animal-uploads");
      }
      res.status(400).json({ message: error.message, stack: error.stack });
    }
  },
  uploadPictures: async (req, res) => {
    try {
      const { animalId } = req.params;
      if ([...animalId].length !== 24) {
        throw new Error(`invalid id`);
      }
      if (req.files === undefined) {
        throw new Error("There are no pictures to upload");
      }
      const pictures = Object.values(req.files);
      const animal = await animalManager.getAnimal(animalId);
      const animalPicturesLength = animal[0].pictures.length;
      const newPicturesLength = pictures.length;
      const totalPictures = animalPicturesLength + newPicturesLength;

      if (totalPictures > 4) {
        throw new Error("You can only have 4 pictures by registration");
      }

      const newPublication = await animalManager.uploadPictures(
        animalId,
        req.files
      );
      // add the animal to the subscriber.publications

      res.status(201).json(newPublication);
    } catch (error) {
      if (req.files) {
        const pictures = req.files;
        for (const picture in pictures) {
          deleteImage.deleteImageSync(
            pictures[picture][0].filename,
            "animal-uploads"
          );
        }
      }
      res.status(400).json({ message: error.message, stack: error.stack });
    }
  },
  updatePrincipalPicture: async (req, res) => {
    try {
      const { animalId } = req.params;
      const { pictureId, isPrincipal } = req.body;
      if ([...animalId].length !== 24 || [...pictureId].length !== 24) {
        throw new Error(`invalid id`);
      }
      const updatePicture = await animalManager.updatePrincipalPicture(
        animalId,
        pictureId,
        isPrincipal
      );
      res.status(200).json(updatePicture);
    } catch (error) {
      res.status(400).json({ message: error.message, stack: error.stack });
    }
  },
};

module.exports = personPublication;