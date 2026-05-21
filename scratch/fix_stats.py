import sys

target_file = r'c:\website\hotel-reservation-system\src\App.jsx'

with open(target_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix stats memoization
start_line = -1
for i, line in enumerate(lines):
    if 'const stats = {' in line and i > 1000 and i < 2000:
        start_line = i
        break

if start_line != -1:
    end_line = -1
    for i in range(start_line, start_line + 20):
        if ' arrivals_today:' in lines[i]:
            end_line = i
            break
    
    if end_line != -1:
        new_stats = [
            "  const stats = useMemo(() => {\n",
            "    if (!appointments) return { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, arrivals_today: 0 };\n",
            "    return {\n",
            "      total: appointments.length,\n",
            "      pending: appointments.filter(a => a.status === 'pending').length,\n",
            "      confirmed: appointments.filter(a => a.status === 'confirmed').length,\n",
            "      completed: appointments.filter(a => a.status === 'completed').length,\n",
            "      cancelled: appointments.filter(a => a.status === 'cancelled').length,\n",
            "      arrivals_today: appointments.filter(a => a.status === 'confirmed' && a.preferred_date === new Date().toISOString().split('T')[0]).length,\n",
            "    };\n",
            "  }, [appointments]);\n"
        ]
        lines[start_line:end_line+2] = new_stats

with open(target_file, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Successfully updated stats memoization.")
