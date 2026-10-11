package in.bharatmail.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.font.FontWeight

private val Forest = Color(0xFF155B43)
private val CanvasColor = Color(0xFFF6F8F6)
private data class SampleMail(val sender: String, val subject: String, val preview: String, val time: String, val initial: String)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = lightColorScheme(primary = Forest, background = CanvasColor)) {
                BharatMailApp()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun BharatMailApp() {
    var folder by remember { mutableStateOf("Inbox") }
    var query by remember { mutableStateOf("") }
    var compose by remember { mutableStateOf(false) }
    var notice by remember { mutableStateOf("Preview mode — sample messages only; no live mailbox connected.") }
    val sample = listOf(
        SampleMail("BharatMail Team", "Welcome to the BharatMail preview", "A new home for your email experience.", "10:42 AM", "B"),
        SampleMail("Aarav Sharma", "Project notes for this week", "Sharing the notes from our last discussion.", "Yesterday", "A"),
        SampleMail("Priya Das", "Photos from Kolkata", "Here are the photos I mentioned.", "Tue", "P"),
        SampleMail("GitHub", "Your weekly development summary", "A quick summary of activity from repositories.", "Mon", "G"),
        SampleMail("Meera Roy", "Re: Design feedback", "Thanks for sharing the first draft.", "Sun", "M")
    )
    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Mail, null, tint = Forest)
                    Spacer(Modifier.width(8.dp))
                    Text("BharatMail", fontWeight = FontWeight.ExtraBold, color = Color(0xFF182D27))
                } },
                actions = { IconButton(onClick = { compose = true }) { Icon(Icons.Default.Edit, "Compose", tint = Forest) } },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = Color.White)
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { compose = true }, containerColor = Forest, contentColor = Color.White) {
                Icon(Icons.Default.Edit, "Compose")
            }
        },
        bottomBar = {
            NavigationBar(containerColor = Color.White) {
                NavigationBarItem(folder == "Inbox", { folder = "Inbox" }, icon = { Icon(Icons.Default.Inbox, null) }, label = { Text("Inbox") })
                NavigationBarItem(folder == "Sent", { folder = "Sent" }, icon = { Icon(Icons.Default.Send, null) }, label = { Text("Sent") })
                NavigationBarItem(folder == "Contacts", { folder = "Contacts" }, icon = { Icon(Icons.Default.People, null) }, label = { Text("Contacts") })
            }
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().background(CanvasColor).padding(padding).padding(horizontal = 16.dp)) {
            Spacer(Modifier.height(14.dp))
            OutlinedTextField(query, { query = it }, modifier = Modifier.fillMaxWidth(), singleLine = true, placeholder = { Text("Search sample mail") }, leadingIcon = { Icon(Icons.Default.Search, null) }, shape = RoundedCornerShape(14.dp))
            Spacer(Modifier.height(18.dp))
            Text(folder, fontSize = 30.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF182D27))
            Text("A calmer, more personal space for your conversations.", fontSize = 12.sp, color = Color(0xFF839188))
            Spacer(Modifier.height(12.dp))
            Text(notice, fontSize = 11.sp, color = Color(0xFF765B16), modifier = Modifier.fillMaxWidth().background(Color(0xFFFFF4D9), RoundedCornerShape(10.dp)).padding(10.dp))
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), contentPadding = PaddingValues(vertical = 12.dp)) {
                items(sample.filter { "${it.sender} ${it.subject} ${it.preview}".contains(query, true) }) { mail ->
                    Row(Modifier.fillMaxWidth().background(Color.White, RoundedCornerShape(14.dp)).clickable { notice = "Sample message only — connect the backend for live email." }.padding(12.dp), verticalAlignment = Alignment.Top) {
                        Box(Modifier.size(38.dp).background(Color(0xFFD8EADB), CircleShape), contentAlignment = Alignment.Center) {
                            Text(mail.initial, color = Forest, fontWeight = FontWeight.Bold)
                        }
                        Spacer(Modifier.width(10.dp))
                        Column(Modifier.weight(1f)) {
                            Text(mail.sender, fontSize = 12.sp, color = Color(0xFF456255), fontWeight = FontWeight.SemiBold)
                            Spacer(Modifier.height(4.dp))
                            Text(mail.subject, fontSize = 13.sp, color = Color(0xFF203A2D), fontWeight = FontWeight.Bold)
                            Spacer(Modifier.height(3.dp))
                            Text(mail.preview, fontSize = 11.sp, color = Color(0xFF8A978F), maxLines = 2)
                        }
                        Text(mail.time, fontSize = 10.sp, color = Color(0xFF8B998F))
                    }
                }
            }
        }
    }
    if (compose) {
        var to by remember { mutableStateOf("") }
        var subject by remember { mutableStateOf("") }
        var body by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { compose = false },
            title = { Text("New message") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(to, { to = it }, label = { Text("To") }, singleLine = true)
                    OutlinedTextField(subject, { subject = it }, label = { Text("Subject") }, singleLine = true)
                    OutlinedTextField(body, { body = it }, label = { Text("Message") }, minLines = 3)
                    Text("Live sending is not connected yet.", fontSize = 11.sp, color = Color(0xFF8A6B1D))
                }
            },
            confirmButton = { TextButton(onClick = { notice = "Not sent: authenticated API and SMTP are not connected."; compose = false }) { Text("Close") } },
            dismissButton = { TextButton(onClick = { compose = false }) { Text("Cancel") } }
        )
    }
}
