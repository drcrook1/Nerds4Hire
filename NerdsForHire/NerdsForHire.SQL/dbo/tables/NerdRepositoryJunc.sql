CREATE TABLE [dbo].[NerdRepositoryJunc]
(
	[Id] INT NOT NULL PRIMARY KEY, 
    [NerdId] INT NULL, 
    [RepositoryId] INT NOT NULL, 
    CONSTRAINT [FK_NerdRepositoryJunc_Nerd] FOREIGN KEY ([NerdId]) REFERENCES [dbo].[Nerd]([Id]), 
    CONSTRAINT [FK_NerdRepositoryJunc_Repository] FOREIGN KEY ([RepositoryId]) REFERENCES [dbo].[GitRepository]([Id])
)
