import os
import re

app_path = "src/App.jsx"
pages_dir = "src/pages"

if not os.path.exists(pages_dir):
    os.makedirs(pages_dir)

with open(app_path, "r", encoding="utf-8") as f:
    content = f.read()

# Shared imports, adjusting relative paths
shared_imports = """import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import Header    from '../components/Header';
import ItemForm  from '../components/ItemForm';
import ItemCard, { BookDetailModal } from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import ItemList  from '../components/ItemList';
import {
  Spinner, Empty, Modal, Field, Input, Select, Textarea,
  StatCard, ToastContainer, Confirm,
} from '../components/ui/Common';

import { useToast } from '../hooks/useToast';
import { useBooks } from '../hooks/useBooks';
import {
  fmt, fmtDate, validatePassword, pwStrength,
  trxBadge, fineBadge,
} from '../utils/formatters';

import {
  login, register, logout, getMe, token, userCache,
  changePassword, updateMyProfile,
  fetchCategories, createCategory, updateCategory, deleteCategory,
  fetchGenres,     createGenre,    updateGenre,    deleteGenre,
  fetchBooks, fetchBookStats, createBook, updateBook, deleteBook,
  fetchUsers,      createUser,     deleteUser,     adminResetPassword,
  fetchTransactions, borrowBook, approveTransaction, rejectTransaction, returnBook, reportBookLost,
  fetchFines, submitFinePayment, approveFine, rejectFine,
  API_BASE,
} from '../services/api';

"""

# Split the content by the separator lines
# Each part starts immediately after the generic separator line
parts = re.split(r'// ══════════════════════════════════════════════════════════════\n', content)

pages_found = []

for part in parts:
    if part.strip() == '':
        continue
    # Find the function name
    # e.g., "function LoginPage("
    match = re.search(r'^function ([A-Z][a-zA-Z0-9]+)', part, re.MULTILINE)
    if match:
        page_name = match.group(1)
        
        # Make sure no other dynamic imports to './services/api' etc exist
        part = part.replace("'./services/api'", "'../services/api'")
        part = part.replace('"./services/api"', '"../services/api"')
        
        with open(os.path.join(pages_dir, f"{page_name}.jsx"), "w", encoding="utf-8") as f:
            f.write(shared_imports)
            f.write(part)
            f.write(f"\nexport default {page_name};\n")
        pages_found.append(page_name)
        print(f"Extracted {page_name} length {len(part)} bytes")

# Now rewrite App.jsx 
app_part_match = re.search(r'(export default function App\(\) \{.*)', content, re.DOTALL)
if app_part_match:
    app_block = app_part_match.group(1)
    
    new_app_content = """// ============================================================
// App.jsx — LenteraPustaka v0.4.1
// Pure CSS · No Tailwind · No injectCSS · Vite + React
// Disinkronkan dengan backend/main.py
// ============================================================
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Header from './components/Header';
import { Spinner, ToastContainer } from './components/ui/Common';
import { useToast } from './hooks/useToast';
import { logout, getMe, token, userCache, fetchTransactions, fetchFines } from './services/api';

"""

    for p in pages_found:
        new_app_content += f"const {p} = React.lazy(() => import('./pages/{p}'));\n"

    new_app_content += """
const GlobalLoadingState = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-slate9)' }}>
    <Spinner text="Memuat halaman..." />
  </div>
);

"""
    new_app_content += app_block

    suspense_wrapper_top = r'(\{\s*renderPage\(safePage\)\s*\})'
    new_app_content = re.sub(suspense_wrapper_top, r'<Suspense fallback={<GlobalLoadingState />}>\n              \1\n            </Suspense>', new_app_content)
    
    new_app_content = new_app_content.replace(
        '<div className="layout-side-inner">\n            {renderPage(safePage)}\n          </div>',
        '<div className="layout-side-inner">\n            <Suspense fallback={<GlobalLoadingState />}>\n              {renderPage(safePage)}\n            </Suspense>\n          </div>'
    )
    
    new_app_content = new_app_content.replace(
        '<LoginPage onLogin={handleLogin}',
        '<Suspense fallback={<GlobalLoadingState />}><LoginPage onLogin={handleLogin}'
    )
    new_app_content = new_app_content.replace(
        'onBack={() => { setPage(\'home\'); setLoginTab(\'login\') }} />',
        'onBack={() => { setPage(\'home\'); setLoginTab(\'login\') }} /></Suspense>'
    )
    
    with open(app_path, "w", encoding="utf-8") as f:
        f.write(new_app_content)
    
    print("App.jsx rewritten successfully.")
else:
    print("Could not find export default function App")
