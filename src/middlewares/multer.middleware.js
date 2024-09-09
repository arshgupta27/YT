import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname) // file.fieldname is the name of the input field in the form
  }
});

export const upload = multer({ storage });