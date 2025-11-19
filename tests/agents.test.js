/**
 * Tests pour les 29 agents
 * Test suite complète pour vérifier tous les agents
 */

import { agents } from '../mcp-server-quebec-electrical/agents/index.js';

describe('Agents System', () => {
  describe('Agent Count and Structure', () => {
    test('should have exactly 29 agents', () => {
      const count = agents.count();
      expect(count.total).toBe(29);
    });

    test('should have 11 electrical agents', () => {
      const count = agents.count();
      expect(count.electrical).toBe(11);
    });

    test('should have 15 development agents', () => {
      const count = agents.count();
      expect(count.development).toBe(15);
    });

    test('should have 3 system agents', () => {
      const count = agents.count();
      expect(count.system).toBe(3);
    });

    test('should list all 29 agent names', () => {
      const list = agents.list();
      expect(list).toHaveLength(29);
      expect(Array.isArray(list)).toBe(true);
    });

    test('should categorize agents correctly', () => {
      const categories = agents.getAgentsByCategory();
      expect(categories.electrical).toHaveLength(11);
      expect(categories.development).toHaveLength(15);
      expect(categories.system).toHaveLength(3);
    });
  });

  describe('Electrical Agents (11)', () => {
    const electricalAgents = [
      'electrical-safety-specialist',
      'electrical-calculator',
      'electrical-compliance-checker',
      'electrical-project-manager',
      'electrical-diagnostician',
      'electrical-supply-manager',
      'electrical-training-coordinator',
      'electrical-directive-tracker',
      'electrical-material-tracker',
      'electrical-dashboard-creator',
      'electrical-site-planner',
    ];

    electricalAgents.forEach((agentName) => {
      test(`${agentName} should exist and have a prompt`, () => {
        const prompt = agents.getPrompt(agentName);
        expect(prompt).toBeDefined();
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(50);
      });

      test(`${agentName} should be invocable`, async () => {
        const result = await agents.invoke(agentName, 'Test task');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toContain(agentName);
      });

      test(`${agentName} should handle context`, async () => {
        const result = await agents.invoke(agentName, 'Test task', 'Test context');
        expect(result).toContain('Contexte: Test context');
        expect(result).toContain('Tâche: Test task');
      });
    });

    test('electrical agents should reference Quebec norms', () => {
      electricalAgents.forEach((agentName) => {
        const prompt = agents.getPrompt(agentName);
        // Should mention at least one Quebec norm
        const hasQuebecNorms = /CEQ|RSST|RBQ|CSA/.test(prompt);
        expect(hasQuebecNorms).toBe(true);
      });
    });
  });

  describe('Development Agents (15)', () => {
    const developmentAgents = [
      'code-reviewer',
      'documentation-generator',
      'test-writer',
      'security-auditor',
      'performance-optimizer',
      'database-designer',
      'api-architect',
      'ui-ux-designer',
      'devops-specialist',
      'cloud-architect',
      'mobile-developer',
      'frontend-specialist',
      'backend-specialist',
      'fullstack-coordinator',
      'project-documenter',
    ];

    developmentAgents.forEach((agentName) => {
      test(`${agentName} should exist and have a prompt`, () => {
        const prompt = agents.getPrompt(agentName);
        expect(prompt).toBeDefined();
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(50);
      });

      test(`${agentName} should be invocable`, async () => {
        const result = await agents.invoke(agentName, 'Test development task');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toContain(agentName);
      });

      test(`${agentName} should mention expertise or responsibilities`, () => {
        const prompt = agents.getPrompt(agentName);
        const hasStructure = /Expertise|Responsibilities/.test(prompt);
        expect(hasStructure).toBe(true);
      });
    });
  });

  describe('System Agents (3)', () => {
    const systemAgents = [
      'system-monitor',
      'log-analyzer',
      'backup-manager',
    ];

    systemAgents.forEach((agentName) => {
      test(`${agentName} should exist and have a prompt`, () => {
        const prompt = agents.getPrompt(agentName);
        expect(prompt).toBeDefined();
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(50);
      });

      test(`${agentName} should be invocable`, async () => {
        const result = await agents.invoke(agentName, 'Test system task');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toContain(agentName);
      });

      test(`${agentName} should be system-focused`, () => {
        const prompt = agents.getPrompt(agentName);
        const isSystemFocused = /monitoring|log|backup|system|performance|health/.test(prompt.toLowerCase());
        expect(isSystemFocused).toBe(true);
      });
    });
  });

  describe('Agent Error Handling', () => {
    test('should throw error for unknown agent', async () => {
      await expect(
        agents.invoke('unknown-agent', 'task')
      ).rejects.toThrow();
    });

    test('should handle empty task gracefully', async () => {
      const result = await agents.invoke('code-reviewer', '');
      expect(result).toBeDefined();
    });

    test('should handle null context', async () => {
      const result = await agents.invoke('code-reviewer', 'task', '');
      expect(result).toBeDefined();
    });
  });

  describe('Agent Prompt Quality', () => {
    test('all agents should have prompts longer than 100 characters', () => {
      const allAgents = agents.list();
      allAgents.forEach((agentName) => {
        const prompt = agents.getPrompt(agentName);
        expect(prompt.length).toBeGreaterThan(100);
      });
    });

    test('all agents should have structured prompts', () => {
      const allAgents = agents.list();
      allAgents.forEach((agentName) => {
        const prompt = agents.getPrompt(agentName);
        // Should have some structure (line breaks)
        expect(prompt).toMatch(/\n/);
      });
    });
  });

  describe('Specific Agent Functionality', () => {
    test('electrical-calculator should mention calculations', () => {
      const prompt = agents.getPrompt('electrical-calculator');
      expect(prompt.toLowerCase()).toMatch(/calcul|dimensionnement|charge/);
    });

    test('security-auditor should mention security topics', () => {
      const prompt = agents.getPrompt('security-auditor');
      expect(prompt.toLowerCase()).toMatch(/security|vulnerability|owasp/);
    });

    test('test-writer should mention testing frameworks', () => {
      const prompt = agents.getPrompt('test-writer');
      expect(prompt).toMatch(/Jest|Mocha|PyTest|testing/);
    });

    test('devops-specialist should mention DevOps tools', () => {
      const prompt = agents.getPrompt('devops-specialist');
      expect(prompt).toMatch(/CI\/CD|Docker|Kubernetes/);
    });

    test('backup-manager should mention backup strategies', () => {
      const prompt = agents.getPrompt('backup-manager');
      expect(prompt.toLowerCase()).toMatch(/backup|recovery|restore/);
    });
  });
});
