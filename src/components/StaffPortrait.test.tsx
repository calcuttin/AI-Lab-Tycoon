import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import EmployeesPanel from './EmployeesPanel';
import EmployeePortrait from './EmployeePortrait';
import { chooseStaffPortraitId, getStaffPortraitId, staffPortraitIds } from '../data/staffPortraits';
import { useGameStore } from '../store/gameStore';

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  localStorage.clear(); useGameStore.getState().initializeGame();
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable:true, value() { this.setAttribute('open',''); } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable:true, value() { this.removeAttribute('open'); } });
  host=document.createElement('div'); document.body.appendChild(host); root=createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });

it('keeps a candidate face through hiring, saving, and loading', () => {
  vi.spyOn(Math, 'random').mockReturnValue(0.999999);
  act(() => root.render(<EmployeesPanel />));
  act(() => [...host.querySelectorAll('button')].find(b=>b.textContent?.includes('Find talent'))!.click());
  const source=host.querySelector('dialog img[src*="/images/staff/"]')!.getAttribute('src');
  expect(source).toContain('/images/staff/');
  act(() => [...host.querySelectorAll<HTMLButtonElement>('dialog button')].find(b=>b.textContent?.startsWith('Hire '))!.click());
  expect(host.querySelector('.employee-card img[src*="/images/staff/"]')!.getAttribute('src')).toBe(source);
  const employee=useGameStore.getState().employees[0];
  expect(staffPortraitIds).toContain(employee.portraitId);
  expect(employee.portraitId).toBe('staff-100');
  act(() => { useGameStore.getState().saveGame(); useGameStore.setState({ employees:[] }); useGameStore.getState().loadGame(); });
  expect(useGameStore.getState().employees[0].portraitId).toBe(employee.portraitId);
  expect(host.querySelector('.employee-card img[src*="/images/staff/"]')!.getAttribute('src')).toBe(source);
});
it('uses a stable face for legacy employees regardless of names or array order', () => {
  const employee={id:'legacy-employee-182',name:'Alex Chen'};
  expect(getStaffPortraitId(employee.id)).toBe('staff-06');
  expect(getStaffPortraitId(employee.id, 'staff-100')).toBe('staff-100');
  act(() => root.render(<EmployeePortrait employee={employee} />));
  const source=host.querySelector('img')!.getAttribute('src');
  act(() => root.render(<EmployeePortrait employee={{...employee,name:'Alex Updated'}} />));
  expect(host.querySelector('img')!.getAttribute('src')).toBe(source);
  expect(getStaffPortraitId(employee.id, 'invalid')).toBe(getStaffPortraitId(employee.id));
});
it('avoids used portraits until all one hundred are represented, then favors the least used', () => {
  vi.spyOn(Math,'random').mockReturnValue(0);
  const staff: {id:string;portraitId:string}[]=[];
  for(let i=0;i<100;i++) staff.push({id:`employee-${i}`,portraitId:chooseStaffPortraitId(staff)});
  expect(new Set(staff.map(e=>e.portraitId)).size).toBe(100);
  staff.push({id:'extra',portraitId:'staff-01'});
  expect(chooseStaffPortraitId(staff)).not.toBe('staff-01');
});
it('keeps existing character artwork and recovers from failed staff portraits', () => {
  act(() => root.render(<EmployeePortrait employee={{id:'gilfoyle',name:'Bertram Gilfoyle',portraitId:'staff-01'}} />));
  expect(host.querySelector('img')!.getAttribute('src')).toContain('architect-v1');
  act(() => root.render(<EmployeePortrait employee={{id:'jared',name:'Donald Jared',portraitId:'staff-01'}} />));
  expect(host.querySelector('img')!.getAttribute('src')).toContain('coo-v1');
  act(() => root.render(<EmployeePortrait employee={{id:'hire-1',name:'Alex Chen',portraitId:'staff-01'}} />));
  act(() => host.querySelector('img')!.dispatchEvent(new Event('error')));
  expect(host.textContent).toBe('AC');
  act(() => root.render(<EmployeePortrait employee={{id:'hire-2',name:'Sam Brown',portraitId:'staff-02'}} />));
  expect(host.querySelector('img')!.getAttribute('src')).toContain('staff-02');
});
