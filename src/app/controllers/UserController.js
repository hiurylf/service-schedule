import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string()
        .strict()
        .required(),
      email: Yup.string()
        .strict()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .strict()
        .min(6),
      provider: Yup.boolean(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExists = await User.findOne({
      where: { email: req.body.email },
    });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().strict(),
      email: Yup.string()
        .strict()
        .email(),
      provider: Yup.boolean(),
      oldPassword: Yup.string()
        .strict()
        .min(6),
      password: Yup.string()
        .strict()
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string()
        .strict()
        .when(
          'password',
          (password, field) =>
            password ? field.required().oneOf([Yup.ref('password')]) : field
          // oneOf = array de possíveis valores q o campo pode ter
        ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    try {
      const { email, oldPassword } = req.body;

      const user = await User.findByPk(req.userId);

      if (email !== user.email) {
        const userExists = await User.findOne({
          where: { email },
        });

        if (userExists) {
          return res.status(400).json({ error: 'Email already exists.' });
        }
      }

      if (oldPassword && !(await user.checkPassword(oldPassword))) {
        return res.status(401).json({ error: 'Password does not match' });
      }

      const { id, name, provider } = await user.update(req.body);

      return res.json({
        id,
        name,
        email,
        provider,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }
}

export default new UserController();
