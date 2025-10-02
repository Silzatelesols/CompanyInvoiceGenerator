# 🧪 Template Builder - Experimental Feature

## Status: **EXPERIMENTAL** - Hidden from Users

The drag-and-drop invoice template builder is currently in **experimental mode** and **not accessible to regular users**.

---

## 🔒 Current Access Status

### For Regular Users
- ❌ **Navigation Link**: Hidden (commented out)
- ❌ **Direct Access**: Blocked with notice screen
- ✅ **Existing Templates**: Available (Modern, Extrape, Default)
- ✅ **Invoice Generation**: Works normally

### For Developers/Testers
- ✅ **Can Enable**: Via environment variable
- ✅ **Full Access**: All features available when enabled
- ✅ **Testing**: Complete functionality for QA

---

## 🎯 Why Experimental?

The template builder is feature-complete but marked experimental for:

1. **User Testing**: Need feedback from beta testers
2. **Performance**: Monitor performance with real usage
3. **Edge Cases**: Identify and fix edge cases
4. **Documentation**: Complete user documentation
5. **Training**: Create tutorials and guides
6. **Integration**: Full PDF generation integration pending
7. **Stability**: Ensure rock-solid stability before release

---

## 🔓 How to Enable (Developers Only)

### Method 1: Environment Variable

Add to your `.env` file:

```env
VITE_ENABLE_TEMPLATE_BUILDER=true
```

Then restart your development server:

```bash
npm run dev
```

### Method 2: Uncomment Navigation Link

In `src/components/Navigation.tsx`, uncomment this line:

```typescript
// Before (Hidden)
// { id: "template-builder", label: "Templates", href: "/template-builder", icon: Palette },

// After (Visible)
{ id: "template-builder", label: "Templates", href: "/template-builder", icon: Palette },
```

**Note**: Even with navigation visible, the feature still requires the environment variable to be enabled.

---

## 🚀 What Users See

### Without Access (Default)
When users navigate to `/template-builder`, they see:

```
┌─────────────────────────────────────┐
│   🧪 Experimental Feature           │
│                                     │
│   Template Builder - Under Dev      │
│   Currently in experimental mode    │
│                                     │
│   Status: Beta Testing              │
│   Availability: Coming Soon         │
│                                     │
│   💡 For Developers                 │
│   Add to .env:                      │
│   VITE_ENABLE_TEMPLATE_BUILDER=true │
└─────────────────────────────────────┘
```

### With Access (Enabled)
Full template builder interface with all features.

---

## 📋 Access Control Implementation

### 1. Navigation Link
**File**: `src/components/Navigation.tsx`

```typescript
const navItems = [
  // ... other items
  // { id: "template-builder", label: "Templates", href: "/template-builder", icon: Palette }, // EXPERIMENTAL
  // ... other items
];
```

**Status**: ✅ Commented out (hidden from users)

### 2. Component Guard
**File**: `src/components/TemplateBuilder/TemplateBuilder.tsx`

```typescript
const EXPERIMENTAL_MODE = import.meta.env.VITE_ENABLE_TEMPLATE_BUILDER !== 'true';

if (EXPERIMENTAL_MODE) {
  return <ExperimentalNotice />;
}
```

**Status**: ✅ Blocks access unless enabled

### 3. Route Still Active
**File**: `src/routes.tsx`

```typescript
{
  path: "template-builder",
  element: <TemplateBuilder />
}
```

**Status**: ✅ Route exists but component blocks access

---

## 🧪 Testing Access Control

### Test 1: Default State (Blocked)
1. Don't set environment variable
2. Try to access `/template-builder` directly
3. **Expected**: See experimental notice
4. **Verify**: Cannot access builder

### Test 2: With Environment Variable (Allowed)
1. Add `VITE_ENABLE_TEMPLATE_BUILDER=true` to `.env`
2. Restart dev server
3. Navigate to `/template-builder`
4. **Expected**: See full template builder
5. **Verify**: All features work

### Test 3: Navigation Hidden
1. Check navigation menu
2. **Expected**: No "Templates" link visible
3. **Verify**: Only Dashboard, Invoices, Clients, Companies, Products, Settings

---

## 📊 Feature Completeness

### ✅ Completed Features
- Drag-and-drop component addition
- Component property editing (typography, colors, borders, etc.)
- 25+ Google Fonts integration
- Canvas with zoom and grid
- Component positioning and resizing
- Undo/redo functionality
- Template save/load
- Live preview
- Component library (25+ components)
- Database schema and migrations

### 🔄 Pending for Production
- [ ] PDF generation integration with custom templates
- [ ] Template marketplace/sharing
- [ ] Import/export templates
- [ ] Advanced styling options
- [ ] Template versioning
- [ ] User documentation and tutorials
- [ ] Performance optimization for large templates
- [ ] Mobile/tablet support
- [ ] Accessibility improvements
- [ ] Comprehensive testing

---

## 🎓 For Beta Testers

### How to Get Access
1. Request access from development team
2. Receive `.env` configuration
3. Follow setup instructions
4. Start testing and provide feedback

### What to Test
1. **Drag & Drop**: Add components to canvas
2. **Property Editing**: Change fonts, colors, sizes
3. **Layout**: Create complete invoice layouts
4. **Save/Load**: Save templates and reload them
5. **Preview**: Check template preview with sample data
6. **Performance**: Test with 20+ components
7. **Edge Cases**: Try unusual configurations
8. **Browser Compatibility**: Test in Chrome, Firefox, Safari

### How to Report Issues
1. Document steps to reproduce
2. Include screenshots/videos
3. Note browser and OS version
4. Describe expected vs actual behavior
5. Submit via GitHub issues or internal tracker

---

## 🔐 Security Considerations

### Access Control
- ✅ Environment variable check
- ✅ Component-level guard
- ✅ No sensitive data exposed
- ✅ Database migrations safe to run

### Data Isolation
- ✅ Templates stored per user
- ✅ No cross-user access
- ✅ Proper authentication required
- ✅ JSONB storage for flexibility

### Production Readiness
- ⚠️ Not production-ready yet
- ⚠️ Keep disabled for end users
- ⚠️ Enable only for testing
- ⚠️ Monitor for issues

---

## 📅 Release Timeline

### Phase 1: Internal Testing (Current)
- **Status**: In Progress
- **Access**: Developers only
- **Duration**: 2-4 weeks
- **Goal**: Identify and fix critical issues

### Phase 2: Beta Testing
- **Status**: Upcoming
- **Access**: Selected beta testers
- **Duration**: 4-6 weeks
- **Goal**: User feedback and refinement

### Phase 3: Limited Release
- **Status**: Planned
- **Access**: Opt-in for users
- **Duration**: 2-3 months
- **Goal**: Gradual rollout and monitoring

### Phase 4: General Availability
- **Status**: Future
- **Access**: All users
- **Duration**: Ongoing
- **Goal**: Full production feature

---

## 🛠️ Maintenance Notes

### Keeping Feature Hidden
To maintain experimental status:
1. ✅ Keep navigation link commented
2. ✅ Keep environment variable check
3. ✅ Don't advertise feature to users
4. ✅ Monitor direct URL access

### Enabling for Production
When ready for release:
1. Remove environment variable check
2. Uncomment navigation link
3. Update documentation
4. Announce to users
5. Provide tutorials

---

## 📝 Environment Variables

### Template Builder
```env
# Enable experimental template builder
VITE_ENABLE_TEMPLATE_BUILDER=true
```

### Other Related Variables
```env
# Existing variables (still needed)
VITE_USE_PDFMAKE=true
VITE_AWS_S3_BUCKET=your-bucket
VITE_AWS_REGION=ap-south-1
# ... other AWS variables
```

---

## 🎯 Success Criteria for Release

Before enabling for all users, ensure:

- [ ] **Stability**: No critical bugs in 2+ weeks of testing
- [ ] **Performance**: Handles 50+ components smoothly
- [ ] **PDF Integration**: Custom templates generate PDFs correctly
- [ ] **Documentation**: Complete user guide available
- [ ] **Training**: Video tutorials created
- [ ] **Support**: Team trained on feature
- [ ] **Feedback**: Positive feedback from beta testers
- [ ] **Edge Cases**: All known edge cases handled
- [ ] **Accessibility**: WCAG 2.1 AA compliance
- [ ] **Mobile**: Responsive design implemented

---

## 📞 Contact

### For Access Requests
- Contact: Development Team
- Email: dev@yourcompany.com
- Slack: #template-builder-beta

### For Bug Reports
- GitHub Issues: [Link to repo]
- Priority: High for blockers, Medium for bugs, Low for enhancements

### For Feature Requests
- Submit via: Product feedback form
- Review: Monthly feature planning meeting

---

## 🎉 Summary

**Current Status**: 🧪 **EXPERIMENTAL - HIDDEN FROM USERS**

**Access**:
- ❌ Regular Users: No access
- ✅ Developers: Via environment variable
- ✅ Beta Testers: Via configuration

**Visibility**:
- ❌ Navigation: Hidden
- ✅ Route: Active but guarded
- ✅ Notice: Shown to unauthorized users

**Next Steps**:
1. Internal testing and bug fixes
2. Beta testing with selected users
3. Documentation and tutorials
4. Gradual rollout to production

The template builder is ready for testing but intentionally hidden from regular users until it's production-ready! 🚀
