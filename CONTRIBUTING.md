# Contributing to Travel Agency ERP

Thank you for considering contributing to this project!

## Development Workflow

1. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes:**
- Follow existing code style and patterns
- Add comments for complex logic
- Update documentation if needed

3. **Test your changes:**
```bash
# Backend
cd backend
npm test  # (if tests exist)

# Frontend
cd frontend
npm run build  # Ensure builds successfully
```

4. **Commit with clear messages:**
```bash
git commit -m "feat: add customer export functionality"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Build process or auxiliary tool changes

5. **Push and create pull request:**
```bash
git push origin feature/your-feature-name
```

## Code Style Guidelines

### Backend (JavaScript/Node.js)
- Use `const` and `let`, avoid `var`
- Use arrow functions for callbacks
- Async/await over callbacks
- Proper error handling with try/catch
- Validate all inputs with Joi
- Use meaningful variable names
- Follow existing folder structure

### Frontend (TypeScript/React)
- Use functional components with hooks
- TypeScript strict mode
- Props interface for all components
- Use custom hooks for reusable logic
- Follow Tailwind CSS utility classes
- Keep components small and focused

### Database
- Always use transactions for financial operations
- Create indexes for frequently queried fields
- Use lean() for read-only queries
- Validate data at schema level

## Adding New Features

### Backend Feature Checklist
- [ ] Create/update Mongoose model with validation
- [ ] Create service functions with business logic
- [ ] Add controller with proper error handling
- [ ] Create routes with authentication/authorization
- [ ] Add Joi validation schemas
- [ ] Test with Postman/curl
- [ ] Update API documentation

### Frontend Feature Checklist
- [ ] Create TypeScript interfaces
- [ ] Add API service functions
- [ ] Create page/component
- [ ] Add to router if needed
- [ ] Add to navigation menu
- [ ] Test responsive design
- [ ] Handle loading and error states

## Testing

### Manual Testing
1. Test all CRUD operations
2. Test with invalid data (validation)
3. Test authorization (different roles)
4. Test edge cases (empty lists, large numbers)
5. Test mobile responsiveness

### Future: Automated Testing
- Jest for backend unit tests
- React Testing Library for frontend

## Database Migrations

When changing schemas:
1. Update model file
2. Create migration script if needed
3. Test on development database first
4. Document changes in CHANGELOG

## Security Checklist

- [ ] No sensitive data in logs
- [ ] Input validation on all endpoints
- [ ] Authorization checks on protected routes  
- [ ] No SQL/NoSQL injection vulnerabilities
- [ ] HTTPS in production
- [ ] Environment variables for secrets
- [ ] Rate limiting on auth endpoints

## Performance Guidelines

- Use indexes for filtered/sorted fields
- Paginate large result sets
- Use select() to limit returned fields
- Avoid N+1 queries
- Cache frequently accessed data
- Optimize bundle size (code splitting)

## Documentation

Update these files when relevant:
- README.md - Major features
- ARCHITECTURE.md - System design changes
- QUICKSTART.md - Setup process changes
- API documentation - New endpoints

## Questions?

For questions or discussions:
- Open an issue for bugs
- Use discussions for feature requests
- Contact team lead for architecture decisions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
