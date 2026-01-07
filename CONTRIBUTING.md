# Contributing to CourseView

Thank you for your interest in contributing to CourseView! This guide will help you get started.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check existing issues to avoid duplicates
2. Test on latest version
3. Verify it's reproducible

When creating a bug report, include:
- **Description**: Clear description of the bug
- **Steps to reproduce**: Minimal steps to trigger the bug
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: Browser, OS, device type
- **Screenshots**: If applicable
- **Console errors**: Any error messages

### Suggesting Features

Feature requests are welcome! Please include:
- **Use case**: Why is this feature needed?
- **Description**: What should the feature do?
- **Mockups**: Visual examples if applicable
- **Alternatives**: Other solutions you've considered

### Pull Requests

1. **Fork** the repository
2. **Create a branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write/update tests**
5. **Run the test suite**
   ```bash
   npm test
   npm run lint
   ```
6. **Commit your changes**
   ```bash
   git commit -m "Add feature: your feature description"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request**

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Modern browser (Chrome/Firefox/Safari)

### Initial Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/courseview.git
cd courseview

# Add upstream remote
git remote add upstream https://github.com/davidcurrie/courseview.git

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Keeping Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

## Development Guidelines

### Code Style

We use:
- **ESLint** for JavaScript/TypeScript linting
- **Prettier** for code formatting
- **TypeScript** for type safety

Run before committing:
```bash
npm run lint        # Check for issues
npm run format      # Auto-format code (if configured)
```

### TypeScript

- Use strict mode
- Avoid `any` types
- Define interfaces for all data structures
- Export types from feature modules

### React Best Practices

- **Functional components** with hooks
- **Co-locate** related files (component + test)
- **Custom hooks** for reusable logic
- **Memo** only when needed for performance
- **Props** should be interfaces, not types

Example component structure:
```typescript
import { useState } from 'react'

interface MyComponentProps {
  title: string
  onAction: () => void
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState(false)

  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  )
}
```

### Testing

- **Write tests** for all new features
- **Update tests** when changing existing code
- **Aim for 80%+ coverage** on new code
- **Test user behavior**, not implementation details

Test structure:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('does something when clicked', async () => {
    const user = userEvent.setup()
    const handleAction = vi.fn()

    render(<MyComponent title="Test" onAction={handleAction} />)

    await user.click(screen.getByRole('button'))
    expect(handleAction).toHaveBeenCalled()
  })
})
```

### File Organization

```
src/features/your-feature/
├── components/
│   ├── YourComponent.tsx
│   └── YourComponent.test.tsx
├── hooks/
│   ├── useYourHook.ts
│   └── useYourHook.test.ts
├── services/
│   ├── yourService.ts
│   └── yourService.test.ts
└── types.ts
```

### Naming Conventions

- **Components**: PascalCase (`MyComponent.tsx`)
- **Hooks**: camelCase with `use` prefix (`useMyHook.ts`)
- **Utilities**: camelCase (`myUtil.ts`)
- **Types**: PascalCase (`MyType`, `MyInterface`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

## Commit Messages

Use conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(gps): add accuracy warning threshold

fix(map): correct coordinate transformation for UTM

docs(readme): add deployment instructions

test(course): add tests for line width calculation
```

## Architecture Guidelines

### State Management

- **Zustand** for global state
- **React hooks** for component state
- **IndexedDB** for persistent data
- Avoid prop drilling - use context sparingly

### Performance

- **Lazy load** heavy components
- **Code split** at route level
- **Memoize** expensive calculations
- **Optimize** re-renders
- **Profile** before optimizing

### Accessibility

All contributions must maintain WCAG AA compliance:
- ✅ Semantic HTML
- ✅ ARIA labels where needed
- ✅ Keyboard navigation
- ✅ Sufficient color contrast (4.5:1 for text)
- ✅ Touch targets 44x44 points minimum

### Mobile-First

Design for mobile, enhance for desktop:
- Touch-friendly UI
- Works offline
- Handles poor connections
- Battery efficient
- Works in bright sunlight

## Areas for Contribution

### High Priority

- [ ] Route recording and playback
- [ ] PDF export functionality
- [ ] Live event tracking
- [ ] Multiple event comparison
- [ ] Course statistics and analysis

### Medium Priority

- [ ] Dark mode
- [ ] Map rotation
- [ ] Custom color schemes
- [ ] Improved error messages
- [ ] Performance optimizations

### Good First Issues

Look for issues labeled `good-first-issue`:
- UI improvements
- Documentation updates
- Test coverage increases
- Bug fixes
- Accessibility enhancements

## Testing Requirements

### Before Submitting PR

Run all checks:
```bash
# Type checking
npm run build

# Linting
npm run lint

# Tests
npm test

# All passing? Good to submit!
```

### Test Coverage

New features should include:
- Unit tests for logic
- Component tests for UI
- Integration tests for workflows
- Update TESTING.md if needed

### Manual Testing

Test your changes on:
- ✅ Desktop Chrome/Firefox
- ✅ iOS Safari (if possible)
- ✅ Android Chrome (if possible)
- ✅ Offline mode
- ✅ With real orienteering files

## Documentation

Update documentation when:
- Adding new features
- Changing APIs
- Updating dependencies
- Fixing bugs that affect usage

Files to update:
- `README.md` - Overview and quick start
- `docs/USER_GUIDE.md` - User instructions
- `TESTING.md` - Testing procedures
- JSDoc comments in code

## Review Process

### What We Look For

- ✅ Code quality and style
- ✅ Test coverage
- ✅ Documentation updates
- ✅ Performance impact
- ✅ Accessibility compliance
- ✅ Mobile compatibility
- ✅ Breaking changes explained

### Feedback

- Be patient - reviews take time
- Respond to comments
- Make requested changes
- Ask questions if unclear
- Don't take feedback personally

## Release Process

1. Version bump in `package.json`
2. Update `CHANGELOG.md`
3. Merge to `main`
4. Tag release
5. Deploy to production

## Getting Help

Stuck? Need guidance?

- 💬 Open a discussion
- 📧 Email maintainers
- 🐛 Comment on related issues
- 📖 Read existing code

## Recognition

Contributors are recognized in:
- CONTRIBUTORS.md
- Release notes
- Documentation credits

Thank you for making CourseView better! 🌲
