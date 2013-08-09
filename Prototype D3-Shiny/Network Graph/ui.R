dynGraph <- function(inputoutputId) 
{
  div(id = inputoutputId, class="d3graph")
}

shinyUI(pageWithSidebar(
  
  headerPanel("Interactive Community Detection"),
  
  sidebarPanel(
    includeHTML("scripts/graph_2.js"),
    helpText(HTML("<p>Select a dataset from the drop down. To start detecting communities, select points and monitor the table below for updates on number of edges within your selection versus outside. When you are happy with the community selected, click a selected point to group them and continue.</p><p>Tip: Use the shift key for multiple selections!</p>")),
    uiOutput("choose_dataset"),    
    #uiOutput("choose_layout"),
    p("User Selection"),
    tableOutput('d3summary'),
    helpText(HTML("All source available on <a href = \"https://github.com/andeek/Community-Detection/tree/master/Prototype%20D3-Shiny/Network%20Graph\" target=\"_blank\">Github</a>"))
  ),
  
  mainPanel(    
    tabsetPanel(      
      tabPanel("Graph", dynGraph(inputoutputId = 'd3io')),
      tabPanel("Groups", htmlOutput("groupTable"))
    )
  )
))
