#!/usr/bin/env python3
"""
Simple MCP Workflow Orchestrator - Quick Start
Francis Végiard Architecture - Bridge le gap d'orchestration

Usage:
    python workflow_orchestrator.py workflows/example.yaml
"""

import yaml
import json
import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import sys
from pathlib import Path


class AgentStatus(Enum):
    PENDING = "○"
    RUNNING = "●"
    COMPLETED = "✓"
    FAILED = "✗"


@dataclass
class Agent:
    id: str
    type: str
    input: Any
    depends_on: List[str] = field(default_factory=list)
    parallel: List[str] = field(default_factory=list)
    timeout: int = 300
    retry: int = 3
    status: AgentStatus = AgentStatus.PENDING
    result: Optional[Any] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


@dataclass
class Workflow:
    name: str
    description: str = ""
    agents: List[Agent] = field(default_factory=list)
    state: Dict[str, Any] = field(default_factory=dict)
    status: str = "initialized"
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class WorkflowOrchestrator:
    """
    Simple orchestrator qui coordonne l'exécution d'agents via MCP.
    
    Features:
    - Sequential & parallel execution
    - Dependency resolution
    - TodoWrite tracking
    - State management
    - Error recovery
    """
    
    def __init__(self, workflow_file: str):
        self.workflow = self._load_workflow(workflow_file)
        self.agent_registry = {}
        self._register_agents()
    
    def _load_workflow(self, workflow_file: str) -> Workflow:
        """Load workflow definition from YAML."""
        with open(workflow_file, 'r') as f:
            data = yaml.safe_load(f)
        
        workflow_data = data['workflow']
        agents = []
        
        for agent_def in workflow_data.get('agents', []):
            agent = Agent(
                id=agent_def['id'],
                type=agent_def['type'],
                input=agent_def.get('input', ''),
                depends_on=agent_def.get('depends_on', []),
                parallel=agent_def.get('parallel', []),
                timeout=agent_def.get('timeout', 300),
                retry=agent_def.get('retry', 3)
            )
            agents.append(agent)
        
        return Workflow(
            name=workflow_data['name'],
            description=workflow_data.get('description', ''),
            agents=agents
        )
    
    def _register_agents(self):
        """Register agent handlers."""
        # Quebec Electrical Agents
        self.agent_registry['quebec-electrical'] = self._quebec_electrical_handler
        
        # Development Agents
        self.agent_registry['development'] = self._development_handler
        
        # System Agents
        self.agent_registry['system'] = self._system_handler
        
        # MCP Bridges
        self.agent_registry['mcp-filesystem'] = self._mcp_filesystem_handler
        self.agent_registry['mcp-google-drive'] = self._mcp_google_drive_handler
        self.agent_registry['mcp-slack'] = self._mcp_slack_handler
        self.agent_registry['claude-code-executor'] = self._claude_code_executor_handler
    
    async def execute(self) -> Dict[str, Any]:
        """Execute workflow with dependency resolution."""
        print(f"\n{'='*80}")
        print(f"🚀 Starting Workflow: {self.workflow.name}")
        print(f"   {self.workflow.description}")
        print(f"{'='*80}\n")
        
        self.workflow.started_at = datetime.now()
        self.workflow.status = "running"
        
        # Build dependency graph
        dep_graph = self._build_dependency_graph()
        
        # Execute agents in topological order
        execution_order = self._topological_sort(dep_graph)
        
        for level in execution_order:
            # Execute agents at same level in parallel
            tasks = []
            for agent_id in level:
                agent = self._get_agent(agent_id)
                tasks.append(self._execute_agent(agent))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Check for failures
            for agent_id, result in zip(level, results):
                if isinstance(result, Exception):
                    agent = self._get_agent(agent_id)
                    agent.status = AgentStatus.FAILED
                    agent.error = str(result)
                    self._print_status()
                    raise result
        
        self.workflow.completed_at = datetime.now()
        self.workflow.status = "completed"
        
        self._print_final_summary()
        
        return {
            'status': 'success',
            'workflow': self.workflow.name,
            'duration': (self.workflow.completed_at - self.workflow.started_at).total_seconds(),
            'results': {agent.id: agent.result for agent in self.workflow.agents}
        }
    
    async def _execute_agent(self, agent: Agent) -> Any:
        """Execute a single agent."""
        print(f"● Starting agent: {agent.id} ({agent.type})")
        
        agent.status = AgentStatus.RUNNING
        agent.started_at = datetime.now()
        
        # Resolve input variables from state
        resolved_input = self._resolve_variables(agent.input)
        
        # Get handler for agent type
        handler = self.agent_registry.get(agent.type)
        if not handler:
            raise ValueError(f"No handler registered for agent type: {agent.type}")
        
        # Execute with retry logic
        for attempt in range(agent.retry):
            try:
                result = await asyncio.wait_for(
                    handler(agent, resolved_input),
                    timeout=agent.timeout
                )
                
                agent.result = result
                agent.status = AgentStatus.COMPLETED
                agent.completed_at = datetime.now()
                
                # Store result in workflow state
                self.workflow.state[f"{agent.id}_output"] = result
                
                duration = (agent.completed_at - agent.started_at).total_seconds()
                print(f"✓ Completed: {agent.id} ({duration:.2f}s)")
                
                return result
                
            except asyncio.TimeoutError:
                print(f"⚠ Timeout on attempt {attempt + 1}/{agent.retry}: {agent.id}")
                if attempt == agent.retry - 1:
                    raise
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
            
            except Exception as e:
                print(f"✗ Error on attempt {attempt + 1}/{agent.retry}: {agent.id} - {e}")
                if attempt == agent.retry - 1:
                    raise
                await asyncio.sleep(2 ** attempt)
    
    def _resolve_variables(self, input_str: str) -> str:
        """Resolve ${variable} references from workflow state."""
        if not isinstance(input_str, str):
            return input_str
        
        import re
        pattern = r'\$\{([^}]+)\}'
        
        def replacer(match):
            var_name = match.group(1)
            return str(self.workflow.state.get(var_name, match.group(0)))
        
        return re.sub(pattern, replacer, input_str)
    
    def _build_dependency_graph(self) -> Dict[str, List[str]]:
        """Build dependency graph from agents."""
        graph = {agent.id: agent.depends_on for agent in self.workflow.agents}
        return graph
    
    def _topological_sort(self, graph: Dict[str, List[str]]) -> List[List[str]]:
        """
        Topological sort with level detection for parallel execution.
        Returns list of lists, where each inner list can be executed in parallel.
        """
        levels = []
        in_degree = {node: 0 for node in graph}
        
        # Calculate in-degrees
        for node in graph:
            for dep in graph[node]:
                in_degree[dep] = in_degree.get(dep, 0)
                in_degree[node] += 1
        
        # Process levels
        while in_degree:
            # Find nodes with no dependencies
            current_level = [node for node, degree in in_degree.items() if degree == 0]
            
            if not current_level:
                raise ValueError("Circular dependency detected in workflow")
            
            levels.append(current_level)
            
            # Remove current level from graph
            for node in current_level:
                del in_degree[node]
                for other_node in list(in_degree.keys()):
                    if node in graph[other_node]:
                        in_degree[other_node] -= 1
        
        return levels
    
    def _get_agent(self, agent_id: str) -> Agent:
        """Get agent by ID."""
        for agent in self.workflow.agents:
            if agent.id == agent_id:
                return agent
        raise ValueError(f"Agent not found: {agent_id}")
    
    def _print_status(self):
        """Print TodoWrite style progress tracking."""
        print(f"\n📊 Workflow Status: {self.workflow.name}")
        print(f"{'─'*80}")
        
        for agent in self.workflow.agents:
            status_icon = agent.status.value
            duration = ""
            if agent.completed_at and agent.started_at:
                duration = f" ({(agent.completed_at - agent.started_at).total_seconds():.1f}s)"
            
            print(f"  {status_icon} {agent.id:<30} [{agent.type}]{duration}")
            if agent.error:
                print(f"     Error: {agent.error}")
        
        print(f"{'─'*80}\n")
    
    def _print_final_summary(self):
        """Print final execution summary."""
        duration = (self.workflow.completed_at - self.workflow.started_at).total_seconds()
        
        completed = sum(1 for a in self.workflow.agents if a.status == AgentStatus.COMPLETED)
        failed = sum(1 for a in self.workflow.agents if a.status == AgentStatus.FAILED)
        
        print(f"\n{'='*80}")
        print(f"✓ Workflow Completed: {self.workflow.name}")
        print(f"  Duration: {duration:.2f}s")
        print(f"  Agents: {completed} completed, {failed} failed")
        print(f"{'='*80}\n")
    
    # ===== AGENT HANDLERS =====
    # These are placeholder implementations - replace with actual MCP calls
    
    async def _quebec_electrical_handler(self, agent: Agent, input_data: Any) -> Any:
        """Handler for Quebec electrical code analysis agents."""
        print(f"  → Quebec Electrical Agent: {agent.id}")
        await asyncio.sleep(1)  # Simulate work
        return {"analysis": "Quebec electrical code compliant", "input": input_data}
    
    async def _development_handler(self, agent: Agent, input_data: Any) -> Any:
        """Handler for development agents."""
        print(f"  → Development Agent: {agent.id}")
        await asyncio.sleep(1)
        return {"code": "generated", "input": input_data}
    
    async def _system_handler(self, agent: Agent, input_data: Any) -> Any:
        """Handler for system agents."""
        print(f"  → System Agent: {agent.id}")
        await asyncio.sleep(1)
        return {"system": "processed", "input": input_data}
    
    async def _mcp_filesystem_handler(self, agent: Agent, input_data: Any) -> Any:
        """Handler for Filesystem MCP."""
        print(f"  → Filesystem MCP: {agent.id}")
        await asyncio.sleep(0.5)
        return {"file": "accessed", "path": input_data}
    
    async def _mcp_google_drive_handler(self, agent: Agent, input_data: Any) -> Any:
        """Handler for Google Drive MCP."""
        print(f"  → Google Drive MCP: {agent.id}")
        await asyncio.sleep(0.5)
        return {"drive": "accessed", "file_id": input_data}
    
    async def _mcp_slack_handler(self, agent: Agent, input_data: Any) -> Any:
        """Handler for Slack MCP."""
        print(f"  → Slack MCP: {agent.id}")
        await asyncio.sleep(0.5)
        return {"slack": "message_sent", "channel": input_data}
    
    async def _claude_code_executor_handler(self, agent: Agent, input_data: Any) -> Any:
        """Handler for Claude Code Executor MCP."""
        print(f"  → Claude Code Executor: {agent.id}")
        print(f"     (Docker containerization + full dev env)")
        await asyncio.sleep(2)  # Simulate longer execution
        return {"execution": "complete", "output": "/mnt/user-data/outputs/"}


async def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python workflow_orchestrator.py <workflow.yaml>")
        sys.exit(1)
    
    workflow_file = sys.argv[1]
    
    if not Path(workflow_file).exists():
        print(f"Error: Workflow file not found: {workflow_file}")
        sys.exit(1)
    
    orchestrator = WorkflowOrchestrator(workflow_file)
    
    try:
        result = await orchestrator.execute()
        print(f"\n✅ Success: {json.dumps(result, indent=2, default=str)}")
    except Exception as e:
        print(f"\n❌ Workflow failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
