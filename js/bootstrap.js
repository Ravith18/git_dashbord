async function initApp(){
  rebuildChecklist();
  renderRulesPage();
  await hydrateAccountsFromMySql();
  await hydrateSessionsFromMySql();
  await hydrateJournalFromMySql();
  renderJournal();
  loadMySqlTrades();
}
initApp();
