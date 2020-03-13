import * as Yup from 'yup';
import File from '../models/File';
import User from '../models/User';

class FileController {
  async store(req, res) {
    const schema = Yup.object().shape({
      filename: Yup.string()
        .strict()
        .required(),
      originalname: Yup.string()
        .strict()
        .required(),
    });
    if (!(await schema.isValid(req.file))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { filename: path, originalname: name } = req.file;

    const file = await File.create({
      name,
      path,
    });

    const user = await User.findByPk(req.userId);
    user.update({ avatar_id: file.id });

    return res.json(file);
  }
}

export default new FileController();
