# Contributing to Quebec Electrical System

First off, thank you for considering contributing to the Quebec Electrical System! It's people like you that make this project better for the electrical engineering community in Quebec.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Adding New Agents](#adding-new-agents)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members
- Be collaborative

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- Python 3.8+ installed
- Claude Code CLI installed (`npm install -g @anthropic-ai/claude-code-cli`)
- Claude Max account (for testing)
- Git for version control

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/quebec-electrical-system.git
   cd quebec-electrical-system
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/fvegiard/claude-code.git
   ```

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. Windows 11, macOS 14, Ubuntu 22.04]
 - Node.js version: [e.g. 20.10.0]
 - Python version: [e.g. 3.11.0]
 - Claude CLI version: [e.g. 1.2.0]

**Additional context**
Any other context about the problem.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- Detailed description of the proposed functionality
- Why this enhancement would be useful
- Possible implementation approach

### Adding New Features

1. **Discuss First**: For major changes, open an issue first to discuss what you would like to change
2. **Create Branch**: Create a feature branch from `main`
3. **Implement**: Write your code following our standards
4. **Test**: Add tests for your changes
5. **Document**: Update relevant documentation
6. **Submit**: Open a pull request

## Development Setup

### Quick Setup

Run the automated setup script:

```bash
./setup.sh
```

### Manual Setup

1. **Install Node.js dependencies:**
   ```bash
   npm run install:all
   ```

2. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

### Project Structure

```
quebec-electrical-system/
├── backend/                    # Backend API and services
│   ├── api/                   # Express routes
│   ├── services/              # Business logic
│   ├── pdf-processing/        # PDF analysis
│   └── knowledge-base/        # FAISS database
├── electron-app/              # Electron application
│   ├── main/                  # Main process
│   └── renderer/              # Renderer process (UI)
├── mcp-server-quebec-electrical/  # MCP server
│   ├── agents/                # Agent definitions
│   └── tools/                 # MCP tools
└── scripts/                   # Deployment scripts
```

## Coding Standards

### JavaScript/Node.js

- Use ES6+ features
- Follow Airbnb style guide
- Use meaningful variable names
- Comment complex logic
- Keep functions small and focused

**Example:**
```javascript
// Good
const calculateTotalLoad = (circuits) => {
  return circuits.reduce((total, circuit) => {
    return total + (circuit.amperage * circuit.voltage);
  }, 0);
};

// Bad
const calc = (c) => {
  let t = 0;
  for(let i=0; i<c.length; i++) {
    t += c[i].a * c[i].v;
  }
  return t;
};
```

### Python

- Follow PEP 8 style guide
- Use type hints where appropriate
- Write docstrings for functions
- Use descriptive variable names

**Example:**
```python
# Good
def analyze_electrical_plan(pdf_path: str) -> dict:
    """
    Analyze an electrical plan PDF and extract elements.

    Args:
        pdf_path: Path to the PDF file

    Returns:
        Dictionary containing extracted elements
    """
    # Implementation
    pass

# Bad
def analyze(p):
    # Implementation
    pass
```

### React Components

- Use functional components with hooks
- Keep components small and reusable
- Use prop types or TypeScript
- Follow React best practices

**Example:**
```jsx
// Good
const AgentCard = ({ agent, onInvoke }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await onInvoke(agent.name);
    setLoading(false);
  };

  return (
    <div className="agent-card">
      <h3>{agent.displayName}</h3>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Processing...' : 'Invoke'}
      </button>
    </div>
  );
};
```

## Commit Guidelines

### Commit Message Format

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(agents): add new material cost calculator agent

Add agent that calculates material costs based on current Quebec pricing.
Includes integration with local supplier databases.

Closes #123

---

fix(pdf): correct OCR text extraction for French accents

The OCR was not properly handling French accented characters in plan annotations.
Updated Tesseract configuration to support French language.

Fixes #456
```

### Commit Best Practices

- Make atomic commits (one logical change per commit)
- Write clear, descriptive commit messages
- Reference issues and pull requests when relevant
- Don't commit generated files or dependencies

## Pull Request Process

### Before Submitting

1. **Update your fork:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests:**
   ```bash
   npm test
   ```

3. **Lint your code:**
   ```bash
   npm run lint
   ```

4. **Update documentation:**
   - Update README.md if needed
   - Add/update JSDoc comments
   - Update relevant guides

### Submitting a Pull Request

1. **Push to your fork:**
   ```bash
   git push origin your-branch-name
   ```

2. **Open a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what and why
   - Reference to related issues
   - Screenshots for UI changes
   - Test results

3. **PR Description Template:**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## How Has This Been Tested?
   Describe tests performed

   ## Checklist:
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests added/updated
   - [ ] All tests pass

   ## Screenshots (if applicable)

   ## Related Issues
   Closes #123
   ```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, maintainers will merge

## Adding New Agents

To add a new electrical agent to the system:

### 1. Define Agent in MCP Server

Edit `mcp-server-quebec-electrical/agents/index.js`:

```javascript
'your-new-agent': `Vous êtes un expert en [specialization] pour le Québec.

Expertise:
- [Domain 1]
- [Domain 2]

Responsabilités:
- [Task 1]
- [Task 2]

Normes de référence:
- CEQ [relevant sections]
- RSST [relevant sections]
- RBQ [relevant requirements]

Toujours:
- Fournir des références précises aux normes
- Inclure les calculs détaillés
- Considérer les aspects de sécurité
- Respecter les codes québécois en vigueur`
```

### 2. Add MCP Tool

Edit `mcp-server-quebec-electrical/index.js`:

```javascript
{
  name: 'invoke_your_new_agent',
  description: 'Agent description for Claude',
  inputSchema: {
    type: 'object',
    properties: {
      task: {
        type: 'string',
        description: 'Task description'
      },
      context: {
        type: 'object',
        description: 'Additional context'
      }
    },
    required: ['task']
  }
}
```

### 3. Update Documentation

- Add agent to `AGENTS_LIST.md`
- Update `README.md` agent count
- Add usage examples to `USER_GUIDE.md`

### 4. Add Tests

Create test file `tests/agents/your-new-agent.test.js`:

```javascript
describe('YourNewAgent', () => {
  it('should respond to invocation', async () => {
    // Test implementation
  });

  it('should provide CEQ references', async () => {
    // Test implementation
  });
});
```

## Documentation

### Documentation Standards

- Write clear, concise documentation
- Include code examples
- Use screenshots for UI features
- Keep documentation up-to-date with code changes

### Documentation Files

- **README.md**: Project overview and quick start
- **CLI_INSTALLATION.md**: Detailed installation guide
- **USER_GUIDE.md**: User documentation
- **TESTING_GUIDE.md**: Testing procedures
- **ARCHITECTURE_CLI.md**: Technical architecture
- **API.md**: API documentation (if you create it)

### Writing Documentation

- Use Markdown formatting
- Include table of contents for long documents
- Add examples and screenshots
- Link between related documents
- Keep language clear and simple

## Questions?

- **General questions**: Open a GitHub Discussion
- **Bug reports**: Open a GitHub Issue
- **Security issues**: Email maintainers directly
- **Feature requests**: Open a GitHub Issue with [Feature Request] tag

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes for their contributions
- Project documentation where relevant

Thank you for contributing to making electrical work in Quebec safer and more efficient! ⚡

