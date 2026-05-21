import sys
import re

target_file = r'c:\website\hotel-reservation-system\src\App.jsx'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

def cleanup_wizard_defs(content):
    # Find all nested Wizard definitions and remove them
    # We'll target the ones that look like local consts within FrontDeskTab
    patterns = [
        r'const WizardStep1 = \(.*?\) => \(.*?\);',
        r'const WizardStep2 = \(.*?\) => {.*?};',
        r'const WizardStep3 = \(.*?\) => {.*?};',
        r'const WizardStep4 = \(.*?\) => {.*?};',
        r'const WizardSuccessCard = \(.*?\) => \(.*?\);',
        r'const WizardHeader = \(.*?\) => \(.*?\);',
        r'const WizardStepBar = \(.*?\) => \(.*?\);'
    ]
    
    new_content = content
    for p in patterns:
        new_content = re.sub(p, '', new_content, flags=re.DOTALL)
    
    return new_content

def extract_views(content):
    # This is more complex. I'll focus on removing duplicates first.
    pass

new_content = cleanup_wizard_defs(content)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Removed nested Wizard definitions.")
