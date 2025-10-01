# Contributing to react-native-ultrastore

Thank you for your interest in contributing! 🎉

## Development Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/yourusername/react-native-ultrastore.git
cd react-native-ultrastore
```

2. **Install dependencies**

```bash
yarn install
```

3. **Run tests**

```bash
yarn test
```

4. **Type checking**

```bash
yarn typecheck
```

5. **Linting**

```bash
yarn lint
```

## Project Structure

```
react-native-ultrastore/
├── src/
│   ├── hooks/              # React hooks
│   │   ├── useUltraStore.ts
│   │   ├── useUltraStoreSelector.ts
│   │   ├── useUltraStoreValue.ts
│   │   └── useUltraStoreSetter.ts
│   ├── middlewares/        # Middleware implementations
│   │   ├── logger.ts
│   │   └── validator.ts
│   ├── utils/              # Utility functions
│   │   ├── createNamespace.ts
│   │   ├── clearAll.ts
│   │   ├── removeKey.ts
│   │   └── getAllKeys.ts
│   ├── __tests__/          # Unit tests
│   ├── storage.ts          # Storage engine (MMKV wrapper)
│   ├── store.ts            # State management
│   ├── types.ts            # TypeScript types
│   └── index.ts            # Main entry point
├── example/                # Example React Native app
├── README.md
├── CHANGELOG.md
└── package.json
```

## Development Workflow

1. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new features
   - Update documentation

3. **Test your changes**

```bash
yarn test
yarn typecheck
yarn lint
```

4. **Commit your changes**

```bash
git commit -m "feat: add new feature"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

5. **Push and create a Pull Request**

```bash
git push origin feature/your-feature-name
```

## Testing

- Write unit tests for all new features
- Ensure all tests pass before submitting PR
- Aim for high code coverage

## Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for formatting
- Write clear, self-documenting code
- Add JSDoc comments for public APIs

## Documentation

- Update README.md for new features
- Add examples to EXAMPLE_USAGE.md
- Update CHANGELOG.md
- Document breaking changes

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- Suggestions for improvements

Thank you for contributing! 🙏
