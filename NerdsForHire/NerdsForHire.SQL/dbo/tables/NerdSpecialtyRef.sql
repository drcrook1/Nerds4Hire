CREATE TABLE [dbo].[NerdSpecialtyRef]
(
	[NerdId] INT NOT NULL, 
    [SpecialtyId] INT NOT NULL, 
    [Id] INT NOT NULL, 
    CONSTRAINT [FK_NerdSpecialtyRef_Nerd] FOREIGN KEY ([NerdId]) REFERENCES [dbo].[Nerd]([Id]), 
    CONSTRAINT [FK_NerdSpecialtyRef_Specialty] FOREIGN KEY ([SpecialtyId]) REFERENCES [dbo].[Specialty]([Id]), 
    CONSTRAINT [PK_NerdSpecialtyRef] PRIMARY KEY ([Id])
)
