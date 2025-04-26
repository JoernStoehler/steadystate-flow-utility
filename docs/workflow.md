# Development Workflow

## Commit Guidelines

### Message Format

```
<type>: <short summary>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

### Pre-Commit Quality Checks

Husky enforces these checks before each commit:

- TypeScript validation
- ESLint checking
- Prettier formatting

### When Creating Commits

1. Keep commits focused on a single change
2. Verify changes work in the browser
3. Update `docs/changelog.md` for user-facing changes

## Pull Request Process

### When to Create a PR

- Required for significant features or breaking changes
- Small changes can be committed directly to main

### PR Requirements

1. **Branch Naming**: Use `feature/descriptive-name` format
2. **Pre-submission Steps**:
   ```bash
   npm run typecheck && npm run lint && npm run build
   ```
3. **Documentation**: Update relevant docs and `changelog.md`
4. **PR Description**: Include type of change, related issues, and testing steps
5. **Quality Checklist**:
   - Tests added/updated
   - Documentation updated
   - Both client and server rendering verified
