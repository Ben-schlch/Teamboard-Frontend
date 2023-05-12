# Teamboard-Frontend
Teamboard Webapp Frontend Development
12.05.2023
Backend: https://github.com/Ben-schlch/Teamboard-Backend

Das Frontend des Teamboards ist ein Angular-Projekt. Aufgrund der vielen dynamischen Daten haben wir uns für Angular entschieden. Das Angular-Projekt ist in mehrere Klassen unterteilt. Die benötigten Interfaces befinden sich in den Dateien "boards.ts" und "communication.ts". Wie die Namen bereits suggerieren, enthält "boards.ts" alle Interfaces, die für die Seiten und die Darstellung der Boards benötigt werden. In "communication.ts" befinden sich alle Interfaces für die Kommunikation mit dem Backend. Diese werden über die Parameter "type\_of\_edit" und "type\_of\_object" geparst. Die eigentliche Verarbeitung erfolgt in der "service.ts", die die Schnittstelle zum Backend darstellt und alle Requests und WebSocket-Nachrichten bearbeitet. Beim Bearbeiten und Senden der Boards an das Backend haben wir uns für einen "fire-and-forget"-Ansatz entschieden. Ein falsches oder nicht bearbeitbares Board ist weniger tragisch, und wir legen Wert auf eine schnelle Kommunikation. Auch das gleichzeitige Bearbeiten der Boards durch mehrere Benutzer hat uns zur Verwendung von WebSockets geführt.

Um die Boards dynamisch vom Backend ins Frontend zu übertragen, haben wir uns für ein rxjs-Observable entschieden. Dieses Observable wird dynamisch im Service aktualisiert. Auf der anderen Seite des Observables befinden sich die drei Komponenten "app.component.ts", "app.component.html" und "app.component.css", die zusammen das Frontend bilden. Die "app.component.ts" greift auf das Observable zu und leitet es an "app.component.html" weiter. Dort wird die Oberfläche mit Hilfe von verschachtelten "ng-for"-Anweisungen gerendert. Dadurch ist ein vollständiges Neuladen der Seite beim Ändern der Boards nicht erforderlich, was sich positiv auf die Performance auswirkt.

Um die Webseite ansprechend zu gestalten, haben wir uns für Clarity-Komponenten entschieden.

Die Sicherheit im Frontend wird teilweise durch Angular bereitgestellt, da dies das Injizieren von Variablen in die HTML-Seite über die Syntax "{{\<Variable\>}}" verhindert. Zudem haben wir in der index.html eine "Content-Security-Policy" implementiert, um die Nutzung externer Ressourcen auf ein Minimum zu beschränken.
